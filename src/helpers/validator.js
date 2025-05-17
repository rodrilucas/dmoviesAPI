import { z } from "zod";

export function int(msg = "Valor inválido.") {
  return z.coerce.number().int(msg);
}

export function positiveInt(min = 1, msg) {
  return int().min(min, msg || `O valor mínimo é ${min}.`);
}

export function pageInt() {
  return z
    .any()
    .refine((val) => !isNaN(val), {
      message: "O parâmetro 'page' deve ser um número.",
    })
    .transform(Number)
    .refine((val) => Number.isInteger(val), {
      message: "O parâmetro 'page' deve ser um número inteiro.",
    })
    .refine((val) => val >= 1, {
      message: "O parâmetro 'page' deve ser no mínimo 1.",
    })
}

export function dateBR(field = "data") {
  return z
    .string({
      required_error: `O parâmetro ${field} é obrigatório.`,
      invalid_type_error: `O parâmetro ${field} deve ser uma string.`,
    })
    .refine((val) => val === "" || /^\d{2}\/\d{2}\/\d{4}$/.test(val), {
      message: `O parâmetro ${field} deve estar no formato dd/mm/aaaa.`,
    })
    .refine((val) => {
      if (val === "") return true;

      const [day, month, year] = val.split("/").map(Number);
      const date = new Date(`${year}-${month}-${day}`);
      const currentYear = new Date().getFullYear();

      return (
        date instanceof Date &&
        !isNaN(date.getTime()) &&
        date.getDate() === day &&
        date.getMonth() + 1 === month &&
        date.getFullYear() === year &&
        year >= 1880 &&
        year <= currentYear
      );
    }, {
      message: `O parâmetro ${field} deve ser uma data válida entre 1880 e o ano atual.`,
    })
    .transform((val) => {
      if (val === "") return null;
      const [day, month, year] = val.split("/").map(Number);
      const date = new Date(`${year}-${month}-${day}`);
      return date.toISOString().split("T")[0];
    });
}

export function limitedInt(min, max, field = "valor") {
  return int()
    .min(min, `O ${field} deve ser no mínimo ${min}.`)
    .max(max, `O ${field} deve ser no máximo ${max}.`);
}

export function stringRequired(field = "campo") {
  return z
    .any()
    .refine(
      (val) => typeof val === "string" && val.trim().length > 0,
      `O parâmetro ${field} é obrigatório.`
    )
    .transform((val) => val.trim());
}

export function enumField(values, msg = "Valor inválido.") {
  return z.enum(values, {
    errorMap: () => ({ message: msg }),
  });
}

export function regexField(regex, msg = "Formato inválido.") {
  return z.string().regex(regex, msg);
}
