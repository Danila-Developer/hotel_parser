import useRequestsQuery from '../../hooks/useRequestsQuery'
import { EuiPanel } from '@elastic/eui'
import RequestInfo from '../../components/RequestInfo'
import {useNavigate} from 'react-router-dom'

const RequestsHistory = () => {
    const { data = [], isFetching } = useRequestsQuery()
    const navigate = useNavigate()

    return <EuiPanel
        className="w-1000"
        hasShadow={false}
        hasBorder={true}
    >
        {
            data.map(item => (
                <RequestInfo key={item.id} data={item} onClick={() => navigate(item.id)} />
            ))
        }
    </EuiPanel>
}

export default RequestsHistory