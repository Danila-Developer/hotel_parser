import { EuiBreadcrumbs, EuiPanel, EuiSpacer } from '@elastic/eui'
import { useNavigate } from 'react-router-dom'

const Breadcrumbs = ({ breadcrumbs }) => {
    const navigate = useNavigate()
    return (
        <>
            <EuiPanel className="m-10">
                <EuiBreadcrumbs
                    truncate={false}
                    breadcrumbs={breadcrumbs.map(item => {
                        return {
                            ...item,
                            onClick: () => navigate(item.to)
                        }
                    })}
                />
            </EuiPanel>
            <EuiSpacer />
        </>
    )
}

export default Breadcrumbs