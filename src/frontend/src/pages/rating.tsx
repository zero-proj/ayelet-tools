import BilibiliVideoProvider from "@/components/rate/provider/bilibili";
import RateTable from "@/components/rate/rate-table";
import {
  RatingContext,
  useEmptyRatingContext,
} from "@/contexts/rating-context";
import DefaultLayout from "@/layouts/default";

export default function Rating() {
  return (
    <DefaultLayout>
      <RatingContext.Provider value={useEmptyRatingContext()}>
        <div className="w-full p-4">
          <div className="w-full flex justify-center pb-4">
            <BilibiliVideoProvider />
          </div>
          <RateTable />
        </div>
      </RatingContext.Provider>
    </DefaultLayout>
  );
}
