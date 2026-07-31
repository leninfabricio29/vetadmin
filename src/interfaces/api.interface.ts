export interface IUser {
  _id: string;
  nombres: string;
  apellidos: string;
  email: string;
  teléfono: string;
  usuario: string;
  rol: 'Administrador' | 'Veterinario' | 'Cajero' | 'Recepcionista';
  estado: 'Activo' | 'Inactivo';
  tipoComisión?: 'Principal' | 'Secundario';
  createdAt?: string;
  updatedAt?: string;
}

export interface IClient {
  _id: string;
  nombres: string;
  apellidos: string;
  cédula: string;
  teléfono: string;
  email: string;
  dirección: string;
  observaciones?: string;
  estado: 'Activo' | 'Inactivo';
  createdAt?: string;
  updatedAt?: string;
}

export interface IPet {
  _id: string;
  nombre: string;
  especie: string;
  raza: string;
  sexo: 'Macho' | 'Hembra';
  edad?: string;
  fechaNacimiento: string;
  peso: number;
  color: string;
  observaciones?: string;
  propietario: string | IClient;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategory {
  _id: string;
  nombre: string;
  descripción?: string;
  estado: 'Activo' | 'Inactivo';
  comisiónPrincipal?: number;
  comisiónSecundario?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProduct {
  _id: string;
  código: string;
  nombre: string;
  descripción?: string;
  categoría: string | ICategory;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMínimo: number;
  unidad: string;
  proveedor: string;
  estado: 'Activo' | 'Inactivo';
  tieneIva?: boolean;
  comisiónPrincipal?: number;
  comisiónSecundario?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IService {
  _id: string;
  nombre: string;
  descripción?: string;
  precio: number;
  duración: string;
  estado: 'Activo' | 'Inactivo';
  tieneIva?: boolean;
  comisiónPrincipal?: number;
  comisiónSecundario?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICashRegister {
  _id: string;
  montoInicial: number;
  montoFinal?: number;
  fechaApertura: string;
  fechaCierre?: string;
  usuario: string | IUser;
  ventas: number;
  ingresos: number;
  egresos: number;
  efectivoEsperado: number;
  efectivoContado?: number;
  diferencia?: number;
  estado: 'Abierta' | 'Cerrada';
  createdAt?: string;
  updatedAt?: string;
}

export interface ICashMovement {
  _id: string;
  tipo: 'Ingreso' | 'Egreso';
  concepto: string;
  descripción?: string;
  monto: number;
  usuario: string | IUser;
  caja: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISaleItem {
  tipo: 'Producto' | 'Servicio';
  producto?: string | IProduct;
  servicio?: string | IService;
  cantidad: number;
  precio: number;
  subtotal: number;
  comisiónPrincipal?: number;
  comisiónSecundario?: number;
  gananciaPrincipal?: number;
  gananciaSecundario?: number;
}

export interface ISale {
  _id: string;
  cliente: string | IClient;
  usuario: string | IUser;
  caja: string;
  fecha: string;
  estado: 'Completada' | 'Anulada';
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  métodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  observaciones?: string;
  comprobanteUrl?: string;
  referenciaTransferencia?: string;
  gananciaPrincipal?: number;
  gananciaSecundario?: number;
  detalles: ISaleItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IInventoryMovement {
  _id: string;
  fecha: string;
  usuario: string | IUser;
  producto: string | IProduct;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  tipo: 'Ingreso' | 'Salida' | 'Ajuste' | 'Venta' | 'Compra';
  createdAt?: string;
  updatedAt?: string;
}

export interface IOperationalCostDetail {
  producto: string;
  proveedor: string;
  precioCompra: number;
  precioVenta: number;
  cantidad: number;
  costoLinea: number;
  ventaLinea: number;
}

export interface IOperationalCostDay {
  _id: { year: number; month: number; day: number };
  fecha: string;
  costoTotal: number;
  ventaTotal: number;
  unidadesVendidas: number;
  detalle: IOperationalCostDetail[];
}
