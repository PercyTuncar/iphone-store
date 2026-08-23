/** Master list of iPhone models sold on the platform (iPhone 13 → 18 Pro Max) */
export const IPHONE_MODELS = [
  'iPhone 13',
  'iPhone 13 mini',
  'iPhone 13 Pro',
  'iPhone 13 Pro Max',
  'iPhone 14',
  'iPhone 14 Plus',
  'iPhone 14 Pro',
  'iPhone 14 Pro Max',
  'iPhone 15',
  'iPhone 15 Plus',
  'iPhone 15 Pro',
  'iPhone 15 Pro Max',
  'iPhone 16',
  'iPhone 16 Plus',
  'iPhone 16 Pro',
  'iPhone 16 Pro Max',
  'iPhone 17',
  'iPhone 17 Plus',
  'iPhone 17 Pro',
  'iPhone 17 Pro Max',
  'iPhone 18',
  'iPhone 18 Pro',
  'iPhone 18 Pro Max',
] as const;

export type IPhoneModel = (typeof IPHONE_MODELS)[number];

export const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'] as const;
export type StorageOption = (typeof STORAGE_OPTIONS)[number];

/** Default technical specs per base model family (editable per product in admin) */
export const DEFAULT_SPECS: Partial<Record<string, {
  display: string;
  chip: string;
  camera: string;
  battery: string;
  connectivity: string;
  os: string;
}>> = {
  'iPhone 15 Pro Max': {
    display: 'Super Retina XDR OLED, 6.7 pulgadas, ProMotion 120 Hz',
    chip: 'Apple A17 Pro — 6 núcleos CPU, 6 núcleos GPU',
    camera: 'Sistema de tres cámaras: principal 48 MP, ultra gran angular 12 MP, teleobjetivo 12 MP 5x',
    battery: 'Hasta 29 horas de reproducción de video',
    connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3, USB-C con USB 3',
    os: 'iOS 17 (actualizable a iOS 18)',
  },
  'iPhone 15 Pro': {
    display: 'Super Retina XDR OLED, 6.1 pulgadas, ProMotion 120 Hz',
    chip: 'Apple A17 Pro — 6 núcleos CPU, 6 núcleos GPU',
    camera: 'Sistema de tres cámaras: principal 48 MP, ultra gran angular 12 MP, teleobjetivo 12 MP 3x',
    battery: 'Hasta 23 horas de reproducción de video',
    connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3, USB-C con USB 3',
    os: 'iOS 17 (actualizable a iOS 18)',
  },
  'iPhone 15': {
    display: 'Super Retina XDR OLED, 6.1 pulgadas',
    chip: 'Apple A16 Bionic — 6 núcleos CPU, 5 núcleos GPU',
    camera: 'Sistema de dos cámaras: principal 48 MP, ultra gran angular 12 MP',
    battery: 'Hasta 20 horas de reproducción de video',
    connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, USB-C',
    os: 'iOS 17 (actualizable a iOS 18)',
  },
  'iPhone 14 Pro Max': {
    display: 'Super Retina XDR OLED, 6.7 pulgadas, ProMotion 120 Hz, Dynamic Island',
    chip: 'Apple A16 Bionic — 6 núcleos CPU, 5 núcleos GPU',
    camera: 'Sistema de tres cámaras: principal 48 MP, ultra gran angular 12 MP, teleobjetivo 12 MP 3x',
    battery: 'Hasta 29 horas de reproducción de video',
    connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, Lightning',
    os: 'iOS 16 (actualizable a iOS 18)',
  },
  'iPhone 13': {
    display: 'Super Retina XDR OLED, 6.1 pulgadas',
    chip: 'Apple A15 Bionic — 6 núcleos CPU, 4 núcleos GPU',
    camera: 'Sistema de dos cámaras: principal 12 MP, ultra gran angular 12 MP',
    battery: 'Hasta 19 horas de reproducción de video',
    connectivity: '5G, Wi-Fi 6, Bluetooth 5.0, Lightning',
    os: 'iOS 15 (actualizable a iOS 17)',
  },
};
