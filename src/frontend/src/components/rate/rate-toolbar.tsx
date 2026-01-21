import { useMemo, useState } from "react";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";

import RateRenderModal from "../rate-render-modal";

import BangumiSubjectProvider from "./provider/bangumi";
import BilibiliVideoProvider from "./provider/bilibili";

import useRating from "@/contexts/rating-context";

const dataProviders = {
  B站视频: BilibiliVideoProvider,
  番剧: BangumiSubjectProvider,
};

export default function RateToolbar() {
  const [provider, setProvider] =
    useState<keyof typeof dataProviders>("B站视频");
  const CurrentProvider = useMemo(() => dataProviders[provider], [provider]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { clear } = useRating();

  function onClear() {
    if (confirm("是否清空所有数据")) {
      clear();
    }
  }

  return (
    <div className="w-full flex pb-4 items-center gap-4">
      <div className="w-32 max-w-64">
        <Select
          className="min-w-24 grow-[1]"
          items={Object.keys(dataProviders).map((key) => ({
            key,
            label: key,
          }))}
          label="数据源"
          selectedKeys={new Set([provider])}
          selectionMode="single"
          onSelectionChange={([item]) =>
            setProvider((item as any) || "B站视频")
          }
        >
          {(key) => <SelectItem>{key.label}</SelectItem>}
        </Select>
      </div>
      <div className="grow-[2]">
        <CurrentProvider />
      </div>
      <div className="grow-[1] flex justify-end gap-1">
        <Button color="primary" onPress={onOpen}>
          生成图片
        </Button>
        <Button onPress={onClear}>清空</Button>
        <RateRenderModal
          isOpen={isOpen}
          provider={provider}
          onOpenChange={onOpenChange}
        />
      </div>
    </div>
  );
}
