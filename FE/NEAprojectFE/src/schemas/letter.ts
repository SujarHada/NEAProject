import * as z from "zod";

export const createLetterSchema = z.object({
  id: z.number().optional(),
  letter_count: z.string().regex(/^[\d\u0966-\u096F/]+$/, "Letter count must be numeric"),
  chalani_no: z.string().regex(/^[\d\u0966-\u096F/]+$/, "Chalani number must be numeric").min(1, "Chalani number is required"),
  voucher_no: z.string().regex(/^[\d\u0966-\u096F/]+$/, "Voucher number must be numeric").min(1, "Voucher number is required"),
  date: z.string().min(1, "Date is required"),
  office_name: z.string().min(1, "Receiver office name is required"),
  receiver_address: z.string().min(1, "Receiver address is required"),
  subject: z.string().min(1, "Subject is required"),
  request_chalani_number: z.string().min(1, "Request chalani number is required"),
  request_letter_count: z.string().regex(/^[\d\u0966-\u096F/]+$/, "Request letter count must be numeric"),
  request_date: z.string().min(1, "Request date is required"),
  gatepass_no: z.string().optional(),

  items: z.array(
    z.object({
      product_id: z.string({ error: "Item is required" }),
      name: z.string().min(1, "Item name is required"),
      company: z.string().min(1, "Company name is required"),
      serial_number: z.string(),
      unit_of_measurement: z.string().min(1, "Unit of measurement is required"),
      quantity: z.string().regex(/^[\d\u0966-\u096F]+$/, "Quantity must be numeric"),
      remarks: z.string().optional(),
    }).refine((item) => {
      const sn = item.serial_number.trim();
      // Allow empty or '-'
      if (sn === "" || sn === "-") return true;
      // Split comma-separated serials
      const count = sn.split(",").map(s => s.trim()).filter(Boolean).length;

      return count === Number(item.quantity);
    }, {
      message: "Serial number count must match quantity",
      path: ["quantity"],
    })
  ).min(1, "At least one item is required"),

  receiver: z.object({
    name: z.string().min(1, "Receiver name is required"),
    post: z.string().min(1, "Receiver post is required"),
    id_card_number: z.string().min(1, "ID card number is required"),
    id_card_type: z.enum([
      "national_id",
      "citizenship",
      "voter_id",
      "passport",
      "drivers_license",
      "pan_card",
      "unknown",
      "employee_id"
    ]),
    office_name: z.string().min(1, "Office name is required"),
    office_address: z.string().min(1, "Office address is required"),
    phone_number: z.string().regex(/^[\d\u0966-\u096F]+$/, "Phone number must be numeric").min(1, "Phone number is required"),
    vehicle_number: z.string().min(1, "Vehicle number is required"),
  }),
}).refine((data) => {
  return data.items.every((item) => item.name && item.company && item.serial_number && item.unit_of_measurement)
}, {
  error: "All items must be filled",
  path: ["items"],
});



export type CreateLetter = z.infer<typeof createLetterSchema>;


export const updateLetterSchema = z.object({
  id: z.number().optional(),
  letter_count: z.string().regex(/^[\d\u0966-\u096F/]+$/, "Letter count must be numeric"),
  chalani_no: z.string().min(1, "Chalani number is required"),
  voucher_no: z.string().min(1, "Voucher number is required"),
  date: z.string().min(1, "Date is required"),
  office_name: z.string().min(1, "Receiver office name is required"),
  receiver_address: z.string().min(1, "Receiver address is required"),
  subject: z.string().min(1, "Subject is required"),
  request_chalani_number: z.string().min(1, "Request chalani number is required"),
  request_letter_count: z.string().regex(/^[\d\u0966-\u096F/]+$/, "Request letter count must be numeric"),
  request_date: z.string().min(1, "Request date is required"),
  gatepass_no: z.string().optional(),

  items: z
    .array(
      z.object({
        product_id: z.string(),
        name: z.string().min(1, "Item name is required"),
        company: z.string().min(1, "Company name is required"),
        serial_number: z.string().min(1, "Serial number is required"),
        unit_of_measurement: z.string().min(1, "Unit of measurement is required"),
        quantity: z.string().regex(/^[\d\u0966-\u096F]+$/, "Quantity must be numeric"),
        remarks: z.string().optional(),
      })
    )
    .min(1, "At least one item is required"),

  receiver: z.object({
    name: z.string().min(1, "Receiver name is required"),
    post: z.string().min(1, "Receiver post is required"),
    id_card_number: z.string().min(1, "ID card number is required"),
    id_card_type: z.enum([
      "national_id",
      "citizenship",
      "voter_id",
      "passport",
      "drivers_license",
      "pan_card",
      "unknown",
      "employee_id"
    ]),
    office_name: z.string().min(1, "Office name is required"),
    office_address: z.string().min(1, "Office address is required"),
    phone_number: z.string().regex(/^[\d\u0966-\u096F]+$/, "Phone number must be numeric").min(1, "Phone number is required"),
    vehicle_number: z.string().min(1, "Vehicle number is required"),
  }),
});

export type EditLetter = z.infer<typeof updateLetterSchema>;
