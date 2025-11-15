import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { userSettingsService } from '@/services/user-settings'

export const useUserSettings = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.user.settings(),
    queryFn: ({ signal }) => userSettingsService.getSettings({ signal }),
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  })
}

export default useUserSettings
