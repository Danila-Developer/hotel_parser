import Breadcrumbs from '../../components/Breadcrumbs'
import {
    EuiFieldNumber,
    EuiCheckbox,
    EuiFormRow,
    EuiPanel,
    EuiComboBox, EuiFlexGroup, EuiFlexItem, EuiButton, EuiSpacer
} from '@elastic/eui'
import {useEffect, useState} from 'react'
import useSettingsQuery from '../../hooks/useSettingsQuery'
import useSettingsMutation from '../../hooks/useSettingsMutation'


const Settings = () => {
    const { data } = useSettingsQuery()
    const { mutate, isPending } = useSettingsMutation()

    const [config, setConfig] = useState({
        processCount: 1,
        clearBD: false,
        exclude: []
    })

    useEffect(() => {
        if (data) {
            setConfig(data)
        }
    }, [data])

    const handleChangeConfig = (name, value) => {
        setConfig((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    const onCreateOption = (searchValue) => {
        const normalizedSearchValue = searchValue.trim()

        if (!normalizedSearchValue) {
            return;
        }

        handleChangeConfig('exclude', [...config.exclude, normalizedSearchValue]);
    }

    const handlePostData = () => {
        mutate(config)
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
                    text: 'Настройки',
                    truncate: false,
                    color: 'text',
                    to: '/'
                }
            ]}
            />
            <EuiPanel
                className="w-1000"
                hasShadow={false}
                hasBorder={true}
            >
                <EuiFormRow label="Количество одновременных запросов (зависит от ресурсов сервера)" fullWidth={true}>
                    <EuiFieldNumber
                        fullWidth={true}
                        value={config.processCount}
                        onChange={(event) => handleChangeConfig('processCount', event.target.value)}
                    />
                </EuiFormRow>
                <EuiFormRow label="Оптимизация" fullWidth={true}>
                    <EuiCheckbox
                        id="check-db"
                        fullWidth={true}
                        checked={config.clearBD}
                        onChange={() => handleChangeConfig('clearBD', !config.clearBD)}
                        label="Автоматически удалять старые запросы (более 20) для оптимизации памяти базы данных"
                    />
                </EuiFormRow>
                <EuiFormRow label="Исключать email, содержащие" fullWidth={true}>
                    <EuiComboBox
                        aria-label="Accessible screen reader label"
                        placeholder="Введите фразы для исключения из поиска"
                        selectedOptions={config.exclude.map(item => ({ label: item }))}
                        onChange={(selected) => handleChangeConfig('exclude', selected.map(item => item.label))}
                        noSuggestions={true}
                        onCreateOption={onCreateOption}
                        isClearable={false}
                        isCaseSensitive
                        fullWidth={true}
                        customOptionText="Нажмите Enter чтобы добавить {searchValue}"
                    />
                </EuiFormRow>
                <EuiSpacer size="l"/>
                <EuiFlexGroup justifyContent="flexEnd">
                    <EuiFlexItem grow={false}>
                        <EuiButton
                            color="primary"
                            fill={true}
                            isLoading={isPending}
                            onClick={handlePostData}
                        >
                            Сохранить
                        </EuiButton>
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiPanel>
        </>
    )
}

export default Settings