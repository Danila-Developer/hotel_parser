import {useEffect, useState} from 'react'
import {
    EuiCheckboxGroup,
    EuiComboBox,
    EuiDualRange,
    EuiFieldNumber,
    EuiFlexGroup,
    EuiFlexItem,
    EuiFormRow,
    EuiPanel,
    EuiButton
} from '@elastic/eui'
import _ from 'lodash'

import useCitiesAutocompleteMutation from '../../hooks/useCitiesAutocompleteMutation'
import getClassCheckboxes from '../utils/getClassCheckboxes'
import Breadcrumbs from '../../components/Breadcrumbs'
import { routes } from '../../router'
import useRequestMutation from '../../hooks/useRequestMutation'
import { useNavigate } from 'react-router-dom'

const CreateRequest = () => {
    const { data, mutate, isPending} = useCitiesAutocompleteMutation()
    const { data: dataRequest, isPending: isPendingRequest, mutate: mutateRequest, isSuccess } = useRequestMutation()
    const [options, setOptions] = useState([])
    const [isInvalid, setIsInvalid] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (_.isArray(data)) {
            setOptions(data.map((item) => ({ label: item?.label, value: item?.label, dest: item?.destType })))
        }
    }, [data])

    const onSearchChange = (searchValue) => {
        if (!searchValue) {
            setOptions([])
            return
        }

        const normalizedSearchValue = searchValue.trim().toLowerCase();

        if (!normalizedSearchValue) {
            setOptions([])
            return
        }

        mutate(normalizedSearchValue)
    }

    const [config, setConfig] = useState({
        place: [],
        rating: {},
        price: [0, 1000],
        reportCount: '',
        destType: ''
    })

    useEffect(() => {
        if (isSuccess) {
            navigate(routes.request.link + _.get(dataRequest, 'id', ''))
        }
    }, [isSuccess])

    const handleChangeConfig = (name, value) => {
        if (name === 'rating') {
            const newCheckboxIdToSelectedMap = {
                ...config.rating,
                ...{
                    [value]: !config.rating[value],
                },
            }
            setConfig((prevState) => ({
                ...prevState,
                [name]: newCheckboxIdToSelectedMap
            }))
        } else if (name === 'place') {
            setConfig((prevState) => ({
                ...prevState,
                [name]: value,
                destType: _.get(value, '[0].dest', ''),
            }))
            console.log(value)
        }
        else {
            setConfig((prevState) => ({
                ...prevState,
                [name]: value
            }))
        }
        if (name === 'place') {
            setIsInvalid(false)
        }
    }

    const handlePost = () => {
        const data = _.cloneDeep(config)

        if (!_.get(data, 'place[0].value', '')) {
            return setIsInvalid(true)
        }

        const rating = []

        Object.keys(_.get(data, 'rating', {})).map(item => {
            if (data.rating[item]) {
                rating.push(item)
            }
        })

        _.set(data, 'place', _.get(data, 'place[0].value', ''))
        _.set(data, 'rating', rating)

        mutateRequest(data)
    }

    return (
        <>
            <Breadcrumbs breadcrumbs={[
                    {
                        text: 'Hotel parser',
                        truncate: false,
                        color: 'primary',
                        to: '/'
                    },
                    {
                        text: 'Создание нового запроса',
                        truncate: false,
                        color: 'text',
                        to: routes.createRequest.path
                    }
                ]}
            />
            <EuiPanel
                className="w-1000"
                hasShadow={false}
                hasBorder={true}
            >
                <EuiFlexGroup direction="column" alignItems="flexEnd">
                    <EuiFlexItem className="w-100p">
                        <EuiFlexGroup>
                            <EuiFlexItem grow={false}>
                                <EuiPanel>
                                    <EuiFormRow label="Оценка объекта">
                                        <EuiCheckboxGroup
                                            options={getClassCheckboxes()}
                                            idToSelectedMap={config.rating}
                                            onChange={(id) => handleChangeConfig('rating', id)}
                                        />
                                    </EuiFormRow>
                                </EuiPanel>
                            </EuiFlexItem>
                            <EuiFlexItem grow={true}>
                                <EuiFlexGroup direction="column" justifyContent="flexStart">
                                    <EuiFlexItem grow={false}>
                                        <EuiComboBox
                                            placeholder="Введите город или страну для поиска"
                                            options={options}
                                            selectedOptions={config.place}
                                            onChange={(selectedOptions) => handleChangeConfig('place', selectedOptions)}
                                            fullWidth={true}
                                            isLoading={isPending}
                                            onSearchChange={onSearchChange}
                                            singleSelection={true}
                                            isInvalid={isInvalid}
                                        />
                                    </EuiFlexItem>
                                    <EuiFlexItem grow={false}>
                                        <EuiFormRow label="Стоимость номера за сутки проживания (EUR)" fullWidth={true}>
                                            <EuiDualRange
                                                id="price-range"
                                                min={0}
                                                max={1000}
                                                value={config.price}
                                                onChange={(value) => handleChangeConfig('price', value)}
                                                showInput={true}
                                                minInputProps={{ 'aria-label': 'Min value' }}
                                                maxInputProps={{ 'aria-label': 'Max value' }}
                                                fullWidth={true}
                                            />
                                        </EuiFormRow>
                                    </EuiFlexItem>
                                    <EuiFlexItem grow={false}>
                                        <EuiFormRow label="Количество отзывов" fullWidth={true}>
                                            <EuiFieldNumber
                                                placeholder="Введите количество отзывов"
                                                value={config.report_count}
                                                onChange={(event) => handleChangeConfig('reportCount', event.target.value)}
                                                prepend="Больше чем"
                                                fullWidth={true}
                                            />
                                        </EuiFormRow>
                                    </EuiFlexItem>
                                </EuiFlexGroup>
                            </EuiFlexItem>

                        </EuiFlexGroup>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                        <EuiButton
                            isLoading={isPendingRequest}
                            onClick={handlePost}
                                >
                            Создать запрос
                        </EuiButton>
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiPanel>
        </>

    )
}

export default CreateRequest