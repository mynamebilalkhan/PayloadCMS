import { Block } from "payload";

export const Testimonials: Block = {
  slug: "testimonials",
  labels: {
    singular: "Testimonials",
    plural: "Testimonials",
  },
  fields: [
    {
      name: "blockName",
      type: "text",
      defaultValue: "Testimonials",
      admin: { readOnly: true },
    },
    {
      name: "items",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "name",
          type: "text",
        },
        {
          name: "company",
          type: "text",
        },
        {
          name: "testimonial",
          type: "textarea",
        },
      ],
    },
  ],
};
