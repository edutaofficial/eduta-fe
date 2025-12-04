import { Badge } from "../ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

interface FAQ {
  faqId: string;
  question: string;
  answer: string;
}

interface FAQComponentProps {
  faqs?: FAQ[];
}

function FAQComponent({ faqs }: FAQComponentProps) {
  // Use API FAQs only - don't fall back to static FAQs
  // Only show FAQ section if FAQs are provided from the API
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Map API FAQs to display format
  const displayFAQs = faqs.map((faq, index) => ({
    id: faq.faqId || `faq-${index}`,
    question: faq.question,
    answer: faq.answer,
  }));

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
          {displayFAQs.map((faq) => (
            <AccordionItem key={faq.id} value={`item-${faq.id}`}>
              <AccordionTrigger className="text-left text-lg md:text-xl font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default FAQComponent;
