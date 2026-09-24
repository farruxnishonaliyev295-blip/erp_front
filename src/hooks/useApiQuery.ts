import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";

export function useApiQuery<T>(key: unknown[], path: string) {
    return useQuery<T>({
        queryKey: key,
        queryFn: () => apiClient.request<T>(path),
    });
}

export function useInvalidate() {
    const qc = useQueryClient();
    return (key: unknown[]) => qc.invalidateQueries({ queryKey: key });
}
