import { useMutation, useQuery, useQueryClient } from "react-query";
import { User } from "@auth0/auth0-react";

import useApiRequests from "../useApiRequest";
import { UserInfo } from "../../auth/userInfo";

export default function useUser(user?: User) {
    const userRemoteId = user?.sub;
    const queryClient = useQueryClient();
    const { get, patch } = useApiRequests();
    const url = `/api/users/user/${userRemoteId}`;

    const getUserInfo = async (): Promise<UserInfo | undefined> => {
        if (userRemoteId) {
            try {
                const response = await get(url);
                return response?.data;
            } catch (error: any) {
                if (error?.response?.status === 404) {
                    return {
                        remoteId: userRemoteId,
                        savedDoctors: [],
                    } as unknown as UserInfo;
                } else {
                    throw error;
                }
            }
        } else {
            return undefined;
        }
    };

    const userInfoQueryKey = `user/${userRemoteId}`;

    const {
        data: userInfo,
        isLoading: isUserInfoLoading,
        isError: isUserInfoError,
        error: userInfoError,
    } = useQuery({
        queryKey: [userInfoQueryKey],
        queryFn: getUserInfo,
    });

    const saveOrRemoveDoctor = async (doctorId: number) => {
        if (userInfo === undefined) {
            return undefined;
        } else {
            if (userInfo.savedDoctors.includes(doctorId)) {
                userInfo.savedDoctors = userInfo.savedDoctors.filter(
                    (existingDoctorId: number) => existingDoctorId !== doctorId
                );
            } else {
                userInfo.savedDoctors.push(doctorId);
            }
            const response = await patch(url, { ...userInfo });
            return response?.data;
        }
    };

    const savedDoctorsMutation = useMutation({
        mutationFn: saveOrRemoveDoctor,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: userInfoQueryKey }),
    });

    const {
        mutate: mutateSavedDoctors,
        reset: resetSavedDoctorsMutation,
        isLoading: isSavedDoctorsMutationLoading,
        isSuccess: isSavedDoctorsMutationSuccess,
        isError: isSavedDoctorsMutationError,
        error: savedDoctorsMutationError,
    } = savedDoctorsMutation;

    return {
        userInfo,
        isUserInfoLoading,
        isUserInfoError,
        userInfoError,
        // saved doctors
        mutateSavedDoctors,
        resetSavedDoctorsMutation,
        isSavedDoctorsMutationLoading,
        isSavedDoctorsMutationSuccess,
        isSavedDoctorsMutationError,
        savedDoctorsMutationError,
    };
}