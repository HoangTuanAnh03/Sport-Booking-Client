import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetServiceByVenueId } from "@/queries/useService";
import { useSideBarStore } from "@/stores/useSideBarStore";
import { Separator } from "@/components/ui/separator";

export function ServiceVenue() {
  const venueIdSelected = useSideBarStore((state) => state.venueIdSelected);

  const { data, isLoading } = useGetServiceByVenueId(venueIdSelected ?? 0);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      {data?.payload.data?.map((category) => (
        <AccordionItem key={category.id} value={`item-${category.id}`}>
          <AccordionTrigger className="text-lg font-semibold">
            {category.name} ({category.numberOfServices})
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2 h-full">
            {category.services.map((service) => (
              <div key={service.id} className="p-2 border rounded flex h-full">
                <h3 className="font-medium w-2/3">{service.name}</h3>
                <div className="border"></div>
                <p className="flex justify-center items-center w-1/3">
                  {Number(100000).toLocaleString("vi-VN")} đ / {service.units}
                </p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
