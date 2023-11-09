import { useMutation } from '@tanstack/react-query'
import { postSettings } from '../../api/settings'


const useSettingsMutation = () => {
    const {
        data,
        isError,
        isSuccess,
        isPending,
        mutate
    } = useMutation({
        mutationKey: ['post-settings'],
        mutationFn: (body) => postSettings(body)
    })

    return {
        isError,
        data,
        mutate: (body) => mutate(body),
        isSuccess,
        isPending
    }
}

export default useSettingsMutation