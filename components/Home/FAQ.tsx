import { Badge } from "../ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { CONSTANTS } from "@/lib/constants";

function FAQ() {
  return (
    <section className="w-full mx-auto py-16 space-y-14">
      {/* Top Badge + Headings */}
      <div className="space-y-4 flex flex-col items-center text-center max-w-container mx-auto md:px-6 px-4">
        <div className="flex flex-col items-center gap-6">
          <Badge variant="info">FAQs</Badge>
          <h2 className="text-2xl md:text-4xl font-semibold text-default-900">
            Frequently Asked Questions
          </h2>
        </div>
      </div>

      {/* Main FAQS */}
      <div className="flex flex-col max-w-container mx-auto md:px-6 px-4">
        <Accordion type="single" collapsible className="w-full">
          {CONSTANTS.FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={`item-${faq.id}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default FAQ;
