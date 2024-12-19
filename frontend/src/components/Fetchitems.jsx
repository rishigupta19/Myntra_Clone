import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { itemsActions } from "../store/itemsSlice";
import { fetchStatusActions } from "../store/fetchStatusSlice";

const FetchItems = () => {
  const fetchStatus = useSelector((store) => store.fetchStatus);
  const dispatch = useDispatch();

  useEffect(() => {
    if (fetchStatus.fetchDone) return;

    const controller = new AbortController();
    const signal = controller.signal;

    dispatch(fetchStatusActions.markFetchingStarted());

    const fetchData = async () => {
      try {
        const response = await fetch("https://myntrabackend.vercel.app", { signal });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        dispatch(itemsActions.addInitialItems(data.items));
        dispatch(fetchStatusActions.markFetchDone());
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err.message);
          dispatch(fetchStatusActions.markFetchFailed(err.message));
        }
      } finally {
        dispatch(fetchStatusActions.markFetchingFinished());
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [fetchStatus.fetchDone, dispatch]);

  if (fetchStatus.isFetching) {
    return <p>Loading items...</p>;
  }

  if (fetchStatus.error) {
    return <p>Error: {fetchStatus.error}</p>;
  }

  return null;
};

export default FetchItems;
