import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

type ApiFunction<TParams = any, TResponse = any> = (
  params: TParams
) => Promise<TResponse>;

type ApiObject = {
  [key: string]: ApiFunction;
};

type QueryResult<TData> = ReturnType<typeof useQuery<TData, Error>> & {
  queryKey: readonly [string, any];
};

type MutationHooks<T extends ApiObject> = {
  [K in keyof T as `use${Capitalize<string & K>}Mutation`]: (
    options?: Omit<
      UseMutationOptions<Awaited<ReturnType<T[K]>>, Error, Parameters<T[K]>[0]>,
      "mutationFn"
    >
  ) => ReturnType<
    typeof useMutation<Awaited<ReturnType<T[K]>>, Error, Parameters<T[K]>[0]>
  >;
};

type QueryHooks<T extends ApiObject> = {
  [K in keyof T as `use${Capitalize<string & K>}Query`]: (
    params: Parameters<T[K]>[0],
    options?: Omit<
      UseQueryOptions<Awaited<ReturnType<T[K]>>, Error>,
      "queryKey" | "queryFn"
    >
  ) => QueryResult<Awaited<ReturnType<T[K]>>>;
};

type Hooks<T extends ApiObject> = MutationHooks<T> & QueryHooks<T>;

export function createApiHooks<T extends ApiObject>(api: T): Hooks<T> {
  const hooks = {} as Hooks<T>;

  for (const key in api) {
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);

    // Create mutation hook
    const mutationHookName = `use${capitalizedKey}Mutation`;
    hooks[mutationHookName as keyof Hooks<T>] = ((options?: any) =>
      useMutation({
        mutationFn: api[key],
        ...options,
      })) as any;

    // Create query hook
    const queryHookName = `use${capitalizedKey}Query`;
    hooks[queryHookName as keyof Hooks<T>] = ((params: any, options?: any) => {
      const queryKey = [key, ...Object.values(params || {})] as const;
      const query = useQuery({
        queryKey,
        queryFn: () => api[key](params),
        ...options,
      });

      return {
        ...query,
        queryKey,
      };
    }) as any;
  }

  return hooks;
}
