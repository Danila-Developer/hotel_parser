import useHotelsQuery from '../../hooks/useHotelsQuery'
import Breadcrumbs from '../../components/Breadcrumbs'
import { EuiPanel, EuiBasicTable } from '@elastic/eui'
import RequestInfo from '../../components/RequestInfo'
import _ from 'lodash'
import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import useRequestByIdQuery from '../../hooks/useRequestByIdQuery'

const Hotels = () => {
    const { id } = useParams()

    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(30)
    const [totalItemCount, setTotalItemCount] = useState(100)

    const { data, isError, isFetching, isSuccess, refetch} = useHotelsQuery(id, pageIndex)
    const { data: requestData, isFetching: isRequestFetching, refetch: requestFefetch} = useRequestByIdQuery(id)

    useEffect(() => {
        refetch()
        requestFefetch()
    }, [id])

    useEffect(() => {
        refetch()
        requestFefetch()
    }, [])

    useEffect(() => {
        refetch()
    }, [pageIndex])

    useEffect(() => {
        setTotalItemCount(_.get(data, 'total', 0))
    }, [data])

    const pagination = {
        pageIndex,
        pageSize,
        totalItemCount,
        showPerPageOptions: false,
    }

    const onTableChange = ({ page }) => {
        if (page) {
            const { index: pageIndex, size: pageSize } = page
            setPageIndex(pageIndex)
            setPageSize(pageSize)
        }
    };

    const columns = [
        {
            field: 'name',
            name: 'Название'
        },
        {
            field: 'email',
            name: 'E-mail',
            render: (item) => {
                if (item) {
                    const data = _.split(item, ',')

                    if (_.size(data) > 0) {
                        return <div>
                            {
                                data.map(email => {
                                    return <p>{email}</p>
                                })
                            }
                        </div>

                    } else return item
                } else return item
            }
        },
        {
            field: 'country',
            name: 'Страна',
            width: 100
        }
    ]

    return(
        <>
            <Breadcrumbs breadcrumbs={[
                    {
                        text: 'Hotel parser',
                        truncate: false,
                        color: 'primary',
                        to: '/'
                    },
                    {
                        text: id ? 'Просмотр запроса' : 'Последний запрос',
                        truncate: false,
                        color: 'text',
                        to: '/'
                    }
                ]}
            />
            <RequestInfo
                data={
                _.isArray(requestData)
                    ? _.get(requestData.filter((item) => item.status === 'isRunning'), '[0]', false) || _.get(requestData, '[0]', {})
                    : requestData
                }
                displayExportButton={true}
            />
            <EuiPanel
                className="w-1000"
                hasShadow={false}
                hasBorder={true}
            >
                <EuiBasicTable
                    items={_.get(data, 'result', [])}
                    columns={columns}
                    noItemsMessage="Пока ничего не обнаружено"
                    loading={isFetching}
                    pagination={pagination}
                    onChange={onTableChange}
                />
            </EuiPanel>
        </>
    )
}

export default Hotels