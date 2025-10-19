import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Service } from "@/types/service";
import { FaPlus, FaMinus } from "react-icons/fa";

interface ServiceItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

interface ServiceSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicesData: any;
  isLoadingServices: boolean;
  selectedServices: ServiceItem[];
  handleQuantityChange: (service: Service, newQuantity: number) => void;
  getServiceQuantity: (serviceId: number) => number;
  calculateServiceTotal: () => number;
}

export default function ServiceSelectionDialog({
  open,
  onOpenChange,
  servicesData,
  isLoadingServices,
  selectedServices,
  handleQuantityChange,
  getServiceQuantity,
  calculateServiceTotal,
}: ServiceSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Chọn dịch vụ</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto py-2">
          {isLoadingServices ? (
            <div className="text-center py-4">Đang tải dịch vụ...</div>
          ) : servicesData?.payload?.data?.length ? (
            <div className="space-y-6">
              {servicesData.payload.data.map((category: any) => (
                <div key={category.id} className="space-y-3">
                  <h3 className="font-bold text-lg border-b border-gray-200 pb-2">
                    {category.name}
                  </h3>
                  {category.services && category.services.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {category.services.map((service: Service) => (
                        <div
                          key={service.id}
                          className="border rounded-lg p-3 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-yellow-500">
                              {service.price} đ
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                handleQuantityChange(
                                  service,
                                  getServiceQuantity(service.id) - 1
                                )
                              }
                            >
                              <FaMinus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center">
                              {getServiceQuantity(service.id)}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                handleQuantityChange(
                                  service,
                                  getServiceQuantity(service.id) + 1
                                )
                              }
                            >
                              <FaPlus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      Không có dịch vụ nào trong danh mục này
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">Không có dịch vụ nào</div>
          )}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div>
            <span className="font-medium">Tổng cộng:</span>
            <span className="ml-2 font-bold text-yellow-500">
              {calculateServiceTotal()} đ
            </span>
          </div>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-green-700 hover:bg-green-800"
          >
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
