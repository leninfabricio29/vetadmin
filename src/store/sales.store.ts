import { create } from 'zustand';

export interface CartItem {
  tipo: 'Producto' | 'Servicio';
  id: string; // references product ID or service ID
  nombre: string;
  precio: number;
  cantidad: number;
  stockMax?: number; // only for products
  código?: string; // only for products
  tieneIva?: boolean;
  comisiónPrincipal?: number;
  comisiónSecundario?: number;
}

export interface POSClient {
  _id: string;
  nombres: string;
  apellidos: string;
  cédula: string;
  teléfono: string;
  email: string;
}

interface SalesState {
  items: CartItem[];
  client: POSClient | null;
  discount: number;
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  notes: string;
  addItem: (item: Omit<CartItem, 'cantidad'>) => void;
  removeItem: (id: string, tipo: 'Producto' | 'Servicio') => void;
  updateQuantity: (id: string, tipo: 'Producto' | 'Servicio', cantidad: number) => void;
  updateItemCommissions: (id: string, tipo: 'Producto' | 'Servicio', comisiónPrincipal: number, comisiónSecundario: number) => void;
  setClient: (client: POSClient | null) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: 'Efectivo' | 'Tarjeta' | 'Transferencia') => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  
  getTotals: () => {
    subtotal: number;
    discount: number;
    iva: number;
    total: number;
  };
}

export const useSalesStore = create<SalesState>((set, get) => ({
  items: [],
  client: null,
  discount: 0,
  paymentMethod: 'Efectivo',
  notes: '',

  addItem: (newItem) => {
    const { items } = get();
    const existing = items.find((i) => i.id === newItem.id && i.tipo === newItem.tipo);

    if (existing) {
      const nextQuantity = existing.cantidad + 1;
      if (newItem.tipo === 'Producto' && newItem.stockMax !== undefined && nextQuantity > newItem.stockMax) {
        return; // Exceeds stock
      }
      get().updateQuantity(newItem.id, newItem.tipo, nextQuantity);
    } else {
      if (newItem.tipo === 'Producto' && newItem.stockMax !== undefined && newItem.stockMax < 1) {
        return; // Out of stock
      }
      set({ items: [...items, { ...newItem, cantidad: 1 }] });
    }
  },

  removeItem: (id, tipo) => {
    set({ items: get().items.filter((i) => !(i.id === id && i.tipo === tipo)) });
  },

  updateQuantity: (id, tipo, cantidad) => {
    if (cantidad <= 0) {
      get().removeItem(id, tipo);
      return;
    }
    set({
      items: get().items.map((i) => {
        if (i.id === id && i.tipo === tipo) {
          if (i.tipo === 'Producto' && i.stockMax !== undefined && cantidad > i.stockMax) {
            return i;
          }
          return { ...i, cantidad };
        }
        return i;
      }),
    });
  },

  updateItemCommissions: (id, tipo, comisiónPrincipal, comisiónSecundario) => {
    set({
      items: get().items.map((i) => {
        if (i.id === id && i.tipo === tipo) {
          return { ...i, comisiónPrincipal, comisiónSecundario };
        }
        return i;
      }),
    });
  },

  setClient: (client) => set({ client }),
  setDiscount: (discount) => set({ discount: Math.max(0, discount) }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setNotes: (notes) => set({ notes }),
  clearCart: () => set({ items: [], client: null, discount: 0, paymentMethod: 'Efectivo', notes: '' }),

  getTotals: () => {
    const { items, discount } = get();
    const subtotal = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const subtotalBaseIva = items
      .filter((item) => item.tieneIva)
      .reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    const discountRatio = subtotal > 0 ? (subtotal - discount) / subtotal : 0;
    const netBaseIva = subtotalBaseIva * discountRatio;

    const taxValorStr = process.env.NEXT_PUBLIC_TAX_VALOR || '15';
    const taxValor = parseFloat(taxValorStr);
    const ivaRate = taxValor / 100;

    const netSubtotal = Math.max(0, subtotal - discount);
    const iva = parseFloat((netBaseIva * ivaRate).toFixed(2));
    const total = parseFloat((netSubtotal + iva).toFixed(2));

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      iva,
      total,
    };
  },
}));
