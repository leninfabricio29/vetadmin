import { z } from 'zod';

export const loginSchema = z.object({
  usuario: z.string().min(1, 'El usuario es obligatorio'),
  contraseña: z.string().min(1, 'La contraseña es obligatoria'),
});

export const passwordSchema = z.object({
  contraseñaActual: z.string().min(1, 'La contraseña actual es obligatoria'),
  contraseñaNueva: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

export const userSchema = z.object({
  nombres: z.string().min(1, 'Los nombres son obligatorios'),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios'),
  email: z.string().email('Debe ingresar un correo electrónico válido'),
  teléfono: z.string().min(1, 'El teléfono es obligatorio'),
  usuario: z.string().min(4, 'El usuario debe tener al menos 4 caracteres'),
  contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  rol: z.enum(['Administrador', 'Veterinario', 'Cajero', 'Recepcionista']),
  estado: z.enum(['Activo', 'Inactivo']).default('Activo'),
  tipoComisión: z.enum(['Principal', 'Secundario']).default('Secundario'),
});

export const clientSchema = z.object({
  nombres: z.string().min(1, 'Los nombres son obligatorios'),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios'),
  cédula: z.string().min(1, 'La cédula/DNI es obligatoria'),
  teléfono: z.string().min(1, 'El teléfono es obligatorio'),
  email: z.string().email('Debe ingresar un correo electrónico válido'),
  dirección: z.string().min(1, 'La dirección es obligatoria'),
  observaciones: z.string().optional(),
  estado: z.enum(['Activo', 'Inactivo']).default('Activo'),
});

export const petSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la mascota es obligatorio'),
  especie: z.string().min(1, 'La especie es obligatoria'),
  raza: z.string().min(1, 'La raza es obligatoria'),
  sexo: z.enum(['Macho', 'Hembra']),
  edad: z.string().optional(),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  peso: z.coerce.number().positive('El peso debe ser mayor a 0'),
  color: z.string().min(1, 'El color es obligatorio'),
  observaciones: z.string().optional(),
  propietario: z.string().min(1, 'Debe seleccionar un propietario'),
});

export const categorySchema = z.object({
  nombre: z.string().min(1, 'El nombre de la categoría es obligatorio'),
  descripción: z.string().optional(),
  estado: z.enum(['Activo', 'Inactivo']).default('Activo'),
  comisiónPrincipal: z.coerce.number().min(0, 'Debe ser mayor o igual a 0').max(100, 'Debe ser menor o igual a 100').default(100),
  comisiónSecundario: z.coerce.number().min(0, 'Debe ser mayor o igual a 0').max(100, 'Debe ser menor o igual a 100').default(0),
});

export const productSchema = z.object({
  código: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripción: z.string().optional(),
  categoría: z.string().min(1, 'Seleccione una categoría'),
  precioCompra: z.coerce.number().nonnegative('El precio de compra debe ser mayor o igual a 0'),
  precioVenta: z.coerce.number().positive('El precio de venta debe ser mayor a 0'),
  stock: z.coerce.number().int().nonnegative('El stock debe ser un entero no negativo'),
  stockMínimo: z.coerce.number().int().nonnegative('El stock mínimo debe ser un entero no negativo'),
  unidad: z.string().min(1, 'La unidad es obligatoria'),
  proveedor: z.string().min(1, 'El proveedor es obligatorio'),
  estado: z.enum(['Activo', 'Inactivo']).default('Activo'),
  tieneIva: z.boolean().default(false),
  comisiónPrincipal: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), z.coerce.number().min(0).max(100).optional()),
  comisiónSecundario: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), z.coerce.number().min(0).max(100).optional()),
});

export const serviceSchema = z.object({
  nombre: z.string().min(1, 'El nombre del servicio es obligatorio'),
  descripción: z.string().optional(),
  precio: z.coerce.number().positive('El precio del servicio debe ser mayor a 0'),
  duración: z.string().min(1, 'La duración es obligatoria (ej. 30 min)'),
  estado: z.enum(['Activo', 'Inactivo']).default('Activo'),
  tieneIva: z.boolean().default(false),
  comisiónPrincipal: z.coerce.number().min(0, 'Debe ser mayor o igual a 0').max(100, 'Debe ser menor o igual a 100').default(100),
  comisiónSecundario: z.coerce.number().min(0, 'Debe ser mayor o igual a 0').max(100, 'Debe ser menor o igual a 100').default(0),
});

export const openRegisterSchema = z.object({
  montoInicial: z.coerce.number().nonnegative('El monto inicial debe ser mayor o igual a 0'),
});

export const closeRegisterSchema = z.object({
  efectivoContado: z.coerce.number().nonnegative('El efectivo contado debe ser mayor o igual a 0'),
});

export const manualMovementSchema = z.object({
  tipo: z.enum(['Ingreso', 'Egreso']),
  concepto: z.string().min(1, 'El concepto es obligatorio'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  descripción: z.string().optional(),
});
