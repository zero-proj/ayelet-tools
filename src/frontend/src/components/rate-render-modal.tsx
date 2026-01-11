import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Switch } from "@heroui/switch";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@heroui/use-theme";

import { DrawConfig, drawRatesToCanvas } from "@/util/rate-canvas-render";
import useRating from "@/contexts/rating-context";

function getProviderDrawConfig(provider: string): Partial<DrawConfig> {
  if (provider === "番剧") {
    return {
      cardHeight: 280,
      cardWidth: 180,
      cardImageHeight: 220,
    };
  }

  return {};
}

export default function RateRenderModal({
  isOpen,
  onOpenChange,
  provider,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  provider: string;
}) {
  const { theme } = useTheme();
  const { rates } = useRating();
  const [drawing, setDrawing] = useState(true);
  const [image, setImage] = useState<string>(null!);
  const [bg, setBg] = useState(theme);
  const backgroundColor = useMemo(
    () => (bg === "light" ? "#FFFFFF" : "#000000"),
    [bg],
  );

  useEffect(() => {
    if (isOpen) {
      drawRatesToCanvas(rates, null!, {
        backgroundColor,
        ...getProviderDrawConfig(provider),
      }).then((data) => {
        setDrawing(false);
        setImage(data);
      });
    }
  }, [rates, bg, backgroundColor, isOpen, provider]);

  return (
    <Modal isOpen={isOpen} size="3xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>生成图片</ModalHeader>
            <ModalBody>
              <div className="w-full flex">
                <div>
                  <span>右键或长按复制即可分享</span>
                </div>
                <div className="ml-auto">
                  <Switch
                    isSelected={bg === "dark"}
                    onValueChange={(selected) => {
                      setBg(selected ? "dark" : "light");
                    }}
                  >
                    深色模式
                  </Switch>
                </div>
              </div>
              {drawing ? (
                <div>正在绘制中</div>
              ) : (
                <Image className="w-full" src={image} />
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
