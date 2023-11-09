import {
    EuiSpacer,
    EuiText,
    EuiFlexGroup,
    EuiFlexItem,
    EuiButton,
    EuiPopover,
    EuiFormRow,
    EuiCheckboxGroup,
    EuiFieldText,
    EuiSplitPanel
} from '@elastic/eui'
import _ from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import getFieldsCheckboxes from '../../pages/utils/getFieldsCheckboxes'
import { postExportRequest } from '../../api/request'
import useRequestStopMutation from '../../hooks/useRequestStopMutation'


const RequestInfo = ({ data, onClick = null, displayExportButton = false }) => {
    const { mutate: stopCurrentRequest } = useRequestStopMutation()

    const [isOpen, setIsOpen] = useState(false)
    const [isClickedButtonStop, setIsClickedButtonStop] = useState(false)

    const [config, setConfig] = useState({
        fields: {
            name: false,
            country: false,
            email: true,
        },
        separator: ';',
        requestId: _.get(data, 'id', null)
    })

    useEffect(() => {
        handleChangeConfig('requestId', _.get(data, 'id', null))
    }, [data])

    const handleChangeConfig = (name, value) => {
        if (name === 'fields') {
            const fields = _.cloneDeep(config.fields)
            _.set(fields, value, !fields[value])

            setConfig((prevState) => ({
                ...prevState,
                [name]: fields
            }))
        } else {
            setConfig((prevState) => ({
                ...prevState,
                [name]: value
            }))
        }
    }

    const handleClick = () => {
        stopCurrentRequest()
        setIsClickedButtonStop(true)
    }

    const statuses = useMemo(() => {
        return {
            isRunning: {
                name: 'В работе',
                color: 'success'
            },
            isPending: {
                name: 'В очереди',
                color: 'warning'
            },
            completed: {
                name: 'Завершен',
                color: 'danger'
            }
        }
    }, [])

    const prices = _.split(_.get(data, 'price', ''), ',')

    const ratings = _.split(_.get(data, 'rating', ''), ',').map((item) => {
        switch (item) {
            case 'class=1':
                return '1 звезда'
            case 'class=2':
                return '2 звезды'
            case 'class=3':
                return '3 звезды'
            case 'class=4':
                return '4 звезды'
            case 'class=5':
                return '5 звезд'
            case 'class=0':
                return 'без звезд'
            default:
                return ''
        }
    })

    const isLoadingStopButton = useMemo(() => {
        if (isClickedButtonStop) {
            if (_.get(data, 'status', '') === 'isRunning') {
                return true
            }
        }

        return false
    }, [isClickedButtonStop, data])

    const handlePost = () => {
        try {
            postExportRequest(config)
                .then((blob) => {
                    const url = window.URL.createObjectURL(
                        new Blob([blob]),
                    )
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute(
                        'download',
                        `${_.get(data, 'place', 'export')}.txt`,
                    )
                    document.body.appendChild(link);
                    link.click()
                    link.parentNode.removeChild(link)
                })
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <>
            <EuiSplitPanel.Outer
                className="w-1000"
                hasShadow={false}
                hasBorder={true}
                onClick={onClick}
                element="div"
            >
                <EuiSplitPanel.Inner>
                    <EuiFlexGroup direction="column" gutterSize="m">
                        <EuiFlexItem>
                            <EuiText size="m"><b>{_.get(data, 'place', '')}</b></EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem>
                            <EuiText size="s">
                                Стоимость номера за сутки проживания: от €{_.get(prices, '[0]', 'не известно')} до €{_.get(prices, '[1]', 'не известно')}<br></br>
                                Оценка объекта: {ratings.join(', ')}<br></br>
                                Количество отзывов: больше чем {_.get(data, 'reportCount', 0)}
                            </EuiText>
                        </EuiFlexItem>
                        {
                            displayExportButton && _.get(data, 'id', false) &&
                                <EuiFlexItem grow={false}>
                                    <EuiFlexGroup justifyContent="spaceBetween">
                                        <EuiFlexItem grow={false}>
                                            <EuiButton
                                                iconType="stopFilled"
                                                color="danger"
                                                fill={false}
                                                element="span"
                                                isDisabled={_.get(data, 'status', '') !== 'isRunning'}
                                                isLoading={isLoadingStopButton}
                                                onClick={handleClick}
                                            >
                                                Остановить
                                            </EuiButton>
                                        </EuiFlexItem>
                                        <EuiFlexItem grow={false}>
                                            <EuiPopover
                                                button={<EuiButton color="warning" onClick={() => setIsOpen(true)}>Экспортировать</EuiButton>}
                                                isOpen={isOpen}
                                                anchorPosition="leftCenter"
                                                closePopover={() => setIsOpen(false)}
                                            >
                                                <EuiFlexGroup direction="column" gutterSize="s">
                                                    <EuiFlexItem>
                                                        <EuiText size="s"><b>Экспортировать результаты запроса</b></EuiText>
                                                    </EuiFlexItem>
                                                    <EuiFlexItem>
                                                        <EuiFormRow label="Необходимые атрибуты">
                                                            <EuiCheckboxGroup
                                                                options={getFieldsCheckboxes()}
                                                                idToSelectedMap={config.fields}
                                                                onChange={(id) => handleChangeConfig('fields', id)}
                                                            />
                                                        </EuiFormRow>
                                                    </EuiFlexItem>
                                                    <EuiFlexItem>
                                                        <EuiFormRow label="Разделитель">
                                                            <EuiFieldText
                                                                value={config.separator}
                                                                onChange={(event) => handleChangeConfig('separator', event.target.value)}
                                                            />
                                                        </EuiFormRow>
                                                    </EuiFlexItem>
                                                    <EuiFlexItem>
                                                        <EuiSpacer />
                                                        <EuiButton onClick={handlePost}>Экспорт</EuiButton>
                                                    </EuiFlexItem>
                                                </EuiFlexGroup>

                                            </EuiPopover>

                                        </EuiFlexItem>
                                    </EuiFlexGroup>
                                </EuiFlexItem>
                        }
                    </EuiFlexGroup>
                </EuiSplitPanel.Inner>
                <EuiSplitPanel.Inner color={statuses[_.get(data, 'status', 'completed')].color}>
                    {
                        `${statuses[_.get(data, 'status', 'completed')].name} (${_.get(data, 'totalHotels', 0)})`
                    }
                </EuiSplitPanel.Inner>
            </EuiSplitPanel.Outer>
            <EuiSpacer />
        </>
    )
}

export default RequestInfo