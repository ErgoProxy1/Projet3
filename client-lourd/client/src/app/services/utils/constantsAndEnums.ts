import { Color } from './color';
import { Point } from './point';

export enum HandleType {
  TopLeft,
  Top,
  TopRight,
  Right,
  BottomRight,
  Bottom,
  BottomLeft,
  Left,
  None,
}

export enum StrokeType {
  Full,
  Outline,
  FullWithOutline,
}

export enum Texture {
  Basic,
  Grayed,
  Light,
  Frothy,
  Degraded,
}

export enum Pattern {
  DottedLine,
  FullLine,
  SpacedLine1,
  SpacedLine2,
  SpacedLine3,
  SpacedLine4,
}

export enum LineCap {
  Butt,
  Round,
  Square,
}

export enum LineJoin {
  Arcs,
  Bevel,
  Miter,
  MiterClip,
  Point,
  Round,
  BezierRound,
}

export enum ToolType {
  Pencil,
  GridTool,
  Eraser,
  None,
}

export enum PrimitiveType {
  Abstract,
  Rectangle,
  Paint,
  Pencil,
  Line,
  Stamp,
  Ellipse,
  Polygon,
  Perimeter,
  Pen,
  Text,
  Quill,
  Spraypaint,
  Fill,
}

export enum KeyboardShortcutType {
  CreateDrawing,
  SaveDrawing,
  OpenGallery,
  ExportDrawing,

  Cut,
  Copy,
  Paste,
  Duplicate,
  Delete,
  SelectAll,

  Undo,
  Redo,

  Pencil, // crayon
  PaintBrush, // pinceau
  Quill, // plume
  Pen, // stylo
  SprayPaint, // Aérosol
  Rectangle,
  Ellipse,
  Polygon,
  Line,
  Text,
  ColorApplicator, // Applicateur de couleur
  PaintBucket, // Seau de peinture
  Eraser,
  Dropper, // Pipette
  Select,

  Grid,
  Magnet,
  ZoomInGrid,
  ZoomOutGrid,

  None,
}

export enum MouseEventType {
  MouseUpLeft,
  MouseUpRight,
  MouseDownLeft,
  MouseDownRight,
  MouseClickLeft,
  MouseClickRight,
  MouseDblClick,
  MouseMove,
  MouseLeave,
  MouseOver,
  InvalidEvent,
}

export enum KeyboardEventType {
  ShiftUp,
  ShiftDown,
  AltUp,
  AltDown,
  AltShiftDown,
  AltShiftUp,
  EscapeDown,
  BackspaceDown,
  KeyUp,
  KeyDown,
  EnterDown,
  SpaceDown,
  InvalidEvent,
}

export enum MessageType {
  Success,
  Info,
  Warning,
  Danger,
  Primary,
  Secondary,
  Light,
  Dark,
}

export enum PaintBucketType {
  Applicator,
  Fill,
}

export const MESSAGE_TYPE_MAP: Map<MessageType, string> = new Map<MessageType, string>([
  [MessageType.Success, 'success'],
  [MessageType.Info, 'info'],
  [MessageType.Warning, 'warning'],
  [MessageType.Danger, 'danger'],
  [MessageType.Primary, 'primary'],
  [MessageType.Secondary, 'secondary'],
  [MessageType.Light, 'light'],
  [MessageType.Dark, 'dark'],
]);

// ----- CONSTANTES ----- //

export const MIN_ROTATION_ANGLE = 0;
export const MAX_ROTATION_ANGLE = 359;
export const DEFAULT_LINE_STROKE_WIDTH = 2;
export const DEFAULT_LINE_ROUNDING = 20;
export const DEFAULT_PEN_STROKE_WIDTH = 6;
export const DEFAULT_PAINT_BUCKET_STROKE_WIDTH = 2;
export const ROUNDING_FACTOR = 0.1;
export const MAX_LINE_ROUNDING = 50;
export const CIRCLE_RADIUS_FACTOR = 1.5;
export const DEFAULT_STROKE_WIDTH = 5;
export const PENCIL_DEFAULT_STROKE_WIDTH = 25;
export const MIN_STROKE_WIDTH = 1;
export const DEFAULT_PEN_MIN_SLIDER_STROKE_WIDTH = 2;
export const MIN_OF_MIN_PEN_STROKE_WIDTH = 1;
export const MAX_OF_MIN_PEN_STROKE_WIDTH = 10;
export const MIN_OF_MAX_PEN_STROKE_WIDTH = 1;
export const MAX_OF_MAX_PEN_STROKE_WIDTH = 50;
export const PEN_SUB_PATH_LENGTH = 1;
export const SECOND_TO_MILI_SECOND = 1000;
export const CURSOR_SPEED_FACTOR = 65;
export const PEN_CURSOR_SPEED_INITIAL_POINT_RANK = 2;
export const DEFAULT_SPRAYPAINT_DELAY = 100;
export const MIN_SPRAYPAINT_FLOW_PER_SECOND = 5;
export const MAX_SPRAYPAINT_FLOW_PER_SECOND = 20;
export const DEFAULT_SPRAYPAINT_RANGE = 30;
export const MIN_SPRAYPAINT_RANGE = 20;
export const MAX_SPRAYPAINT_RANGE = 150;
export const SPRAYPAINT_FLOW_SIZE = 25;
export const SPRAYPAINT_POINT_SIZE = 0.8;
export const MAX_STROKE_WIDTH = 50;
export const SHIFT_KEY_CODE = '16';
export const ALT_KEY_CODE = '18';
export const ESCAPE_KEY_CODE = '17';
export const BACKSPACE_KEY_CODE = '8';
export const SPACE_KEY_CODE = '32';
export const ENTER_KEY_CODE = '13';
export const DELETE_KEY_CODE = '46';
export const MIN_PAINT_BUCKET_TOLERANCE = 0;
export const MAX_PAINT_BUCKET_TOLERANCE = 100;
export const DEFAULT_PAINT_BUCKET_TOLERANCE = 10;
export const DEFAULT_FILL_STROKE_WIDTH = 2;
export const CANVAS_RATIO_WIDTH = 800;
export const CANVAS_RATIO_HEIGHT = 600;
export const CANVAS_VIEWBOX = `0 0 ${CANVAS_RATIO_WIDTH} ${CANVAS_RATIO_HEIGHT}`

// ------- CONSTANTES DE PALETTE ----------//
export interface PaletteChoiceInfo {
  positionX: number;
  positionY: number;
  color: string;
}

export const PALETTE_CHOICES: PaletteChoiceInfo[] = [
  { positionX: 0, positionY: 0, color: '#000000' },
  { positionX: 50, positionY: 0, color: '#FF0000' },
  { positionX: 100, positionY: 0, color: '#FFA500' },
  { positionX: 150, positionY: 0, color: '#CDFF00' },
  { positionX: 200, positionY: 0, color: '#32FF00' },
  { positionX: 250, positionY: 0, color: '#00FF80' },
  { positionX: 0, positionY: 50, color: '#474747' },
  { positionX: 50, positionY: 50, color: '#800000' },
  { positionX: 100, positionY: 50, color: '#804C00' },
  { positionX: 150, positionY: 50, color: '#657F02' },
  { positionX: 200, positionY: 50, color: '#1A7E00' },
  { positionX: 250, positionY: 50, color: '#007F32' },
  { positionX: 0, positionY: 100, color: '#A8A8A8' },
  { positionX: 50, positionY: 100, color: '#01FFFF' },
  { positionX: 100, positionY: 100, color: '#0064FF' },
  { positionX: 150, positionY: 100, color: '#3300FF' },
  { positionX: 200, positionY: 100, color: '#CC00FF' },
  { positionX: 250, positionY: 100, color: '#FF0198' },
  { positionX: 0, positionY: 150, color: '#FFFFFF' },
  { positionX: 50, positionY: 150, color: '#017F7E' },
  { positionX: 100, positionY: 150, color: '#01327F' },
  { positionX: 150, positionY: 150, color: '#19007F' },
  { positionX: 200, positionY: 150, color: '#66007F' },
  { positionX: 250, positionY: 150, color: '#7F014B' },
];

export const PALETTE_CHOICES_RGB: Color[] = [
  new Color(0, 0, 0, 1),
  new Color(255, 255, 255, 1),
  new Color(255, 0, 0, 1),
  new Color(0, 255, 0, 1),
  new Color(0, 0, 255, 1),
  new Color(255, 165, 0, 1),
  new Color(204, 0, 255, 1),

  new Color(71, 71, 71, 1),
  new Color(0, 100, 155, 1),
  new Color(255, 1, 152, 1),
  new Color(0, 255, 128, 1),
  new Color(1, 255, 255, 1),
  new Color(205, 255, 0, 1),
  new Color(127, 1, 75, 1),

  new Color(168, 168, 168, 1),
  new Color(1, 127, 126, 1),
  new Color(128, 0, 0, 1),
  new Color(26, 126, 0, 1),
  new Color(25, 0, 127, 1),
  new Color(128, 76, 0, 1),
  new Color(102, 0, 127, 1),
];

// ----- Constantes Polygone ----- //
export const POLYGON_NAMES: Map<number, string> = new Map([
  [3, '3(triangle)'],
  [4, '4(diamant)'],
  [5, '5(pentagone)'],
  [6, '6(hexagone)'],
  [7, '7(heptagone)'],
  [8, '8(octagone)'],
  [9, '9(nonagone)'],
  [10, '10(decagone)'],
  [11, '11(hendecagone)'],
  [12, '12(dodecagone)'],
]);

export enum SavingType {
  SaveOnServer,
  SaveLocally,
}
export interface SavingTypeInterface {
  id: SavingType;
  text: string;
}

export const SAVING_TYPE_CHOICES: SavingTypeInterface[] = [
  { id: SavingType.SaveOnServer, text: 'Sauvegarder sur le serveur' },
  { id: SavingType.SaveLocally, text: 'Sauvegarder localement' },
];

// ----- Constantes Grille ----- //
export const MAX_ALPHA = 1;
export const DEFAULT_GRID_ALPHA = 0.5;
export const MIN_GRID_ALPHA = 0.1;
export const MIN_GRID_SIZE = 10;
export const DEFAULT_GRID_SIZE = 50;
export const MAX_GRID_SIZE = 300;

// ----- Constantes Souris -----//
export const LEFT_MOUSE_BUTTON = 0;
export const RIGHT_MOUSE_BUTTON = 2;

// ----- Constantes Efface -----//
export const MIN_ERASER_SIZE = 25;
export const MAX_ERASER_SIZE = 50;
export const ERASER_FILL_COLOR: Color = new Color(255, 255, 255);
export const ERASER_STROKE_COLOR: Color = new Color(0, 0, 0);
export const HIGHLIGH_COLOR: Color = new Color(255, 0, 0);
export const HIGHLIGH_BACKUP_COLOR: Color = new Color(0, 255, 255);

// ----- Constantes pour le text -----//
export interface FontInfo {
  name: string;
  family: string;
}

export const FONTS: FontInfo[] = [
  { name: 'Arial', family: 'Arial, sans-serif' },
  { name: 'Bookman', family: 'Bookman, URW Bookman L, serif' },
  { name: 'Comic Sans', family: 'Comic Sans MS, Comic Sans, cursive' },
  { name: 'Courier', family: 'Courier New, monospace' },
  { name: 'Helvetica', family: 'Helvetica, sans-serif' },
  { name: 'Times New Roman', family: 'Times New Roman, sans-serif' },
  { name: 'Verdana', family: 'Verdana, sans-serif' },
];

export interface AlignInfo {
  name: string;
  value: string;
}
export const ALIGNS: AlignInfo[] = [
  { name: 'Gauche', value: 'start' },
  { name: 'Centre', value: 'middle' },
  { name: 'Droite', value: 'end' },
];

// ----- Constantes pour exporter le dessin -----//
export enum ExportType {
  BMP,
  JPG,
  PNG,
  SVG,
}
export interface ExportTypeInterface {
  readonly id: ExportType;
  readonly name: string;
}

export const EXPORT_TYPES: ExportTypeInterface[] = [
  { id: ExportType.BMP, name: '.bmp' },
  { id: ExportType.JPG, name: '.jpg' },
  { id: ExportType.PNG, name: '.png' },
  { id: ExportType.SVG, name: '.svg' },
];

export enum GridAlignment {
  None,
  TopLeft,
  CenterLeft,
  BottomLeft,
  BottomCenter,
  BottomRight,
  CenterRight,
  TopRight,
  TopCenter,
  Center,
}

// ----- Fin Constantes pour export le dessin -----//
export const PASTE_OFFSET: Point = new Point(50, 50);
export const ORIGIN: Point = new Point(0, 0);

// ----- Constantes de curseur ----- //
export const NO_CURSOR = 'none';
export const DEFAULT_CURSOR = 'default';
export const CROSSHAIR_CURSOR = 'crosshair';
export const POINTER_CURSOR = 'pointer';
export const TEXT_CURSOR = 'text';
export const GRAB_CURSOR = 'grab';
export const TOP_LEFT_HANDLE_CURSOR = 'nw-resize';
export const TOP_HANDLE_CURSOR = 'n-resize';
export const TOP_RIGHT_HANDLE_CURSOR = 'ne-resize';
export const LEFT_HANDLE_CURSOR = 'w-resize';
export const RIGHT_HANDLE_CURSOR = 'e-resize';
export const BOTTOM_LEFT_HANDLE_CURSOR = 'sw-resize';
export const BOTTOM_HANDLE_CURSOR = 's-resize';
export const BOTTOM_RIGHT_HANDLE_CURSOR = 'se-resize';

// Pour le traçage du contour
export interface Contouring {
  type: string;
  points: Point[];
}