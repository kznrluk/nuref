import {useRouter} from "next/router";
import {useEffect, useState} from "react";

const useWorkSpaceID = () => {
    const router = useRouter();
    const [workSpaceID, setWorkSpaceID] = useState<string>();

    useEffect(() => {
        if (router.isReady) {
            const {wsid} = router.query;
            setWorkSpaceID(!wsid || wsid.length === 0 ? 'main' : Array.isArray(wsid) ? wsid[0] : wsid)
        }
    }, [router.isReady, workSpaceID])

    return workSpaceID;
}

export default useWorkSpaceID