export interface ActionItem {
  text: string;
  icon: string;
  action: () => void;
  visible: () => boolean;
}
