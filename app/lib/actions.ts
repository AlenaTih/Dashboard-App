"use server" // This is used to mark all the exported functions within the file as Server Actions

import { z } from "zod"
import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: "Please select a customer."
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: "Please enter an amount greater than $0." })
        ,
    status: z.enum(["pending", "paid"], {
        invalid_type_error: "Please select an invoice status."
    }),
    date: z.string(),
  })

export type State = {
    errors? : {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
}

const CreateInvoice = FormSchema.omit({ id: true, date: true })

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({id: true, date: true})

export async function createInvoice(prevState: State, formData: FormData) {
    // Validate form using Zod
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get("customerId"),
        amount: formData.get("amount"),
        status: formData.get("status"),
    })

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing fields. Failed to create invoice.",
        }
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data
    const amountInCents = amount * 100
    const date = new Date().toISOString().split("T")[0]

    // Insert data into the database
    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `
    } catch (error) {
        console.error(error)
        // If a database error occurs, return a more specific error.
        return {
            message: "Database error: Failed to create invoice.",
        }
    }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath("/dashboard/invoices")
    redirect("/dashboard/invoices")
}
 
export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get("customerId"),
        amount: formData.get("amount"),
        status: formData.get("status")
    })

    const amountInCents = amount * 100

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `
    } catch (error) {
        console.error(error)
        return {
            message: "Database error: Failed to update invoice.",
        }
    }

    revalidatePath("/dashboard/invoices")
    redirect("/dashboard/invoices")
}

export async function deleteInvoice(id: string) {
    // throw new Error("Failed to delete invoice")

    try {
        await sql`
            DELETE FROM invoices WHERE id = ${id}
        `
        revalidatePath("/dashboard/invoices")
        return {
            message: "Deleted Invoice."
        }
    } catch (error) {
        console.error(error)
        return {
            message: "Database error: Failed to delete invoice."
        }
    }
}
