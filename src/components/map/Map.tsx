import { useState } from "react";
import { Box } from "theme-ui";
import { useToasts } from "react-toast-notifications";
//Map.tsx
import MapControls from "./MapControls";
import MapInteraction from "./MapInteraction";
import MapGrid from "./MapGrid";
import { useMestreId } from "../../contexts/MestreContext";
import DrawingTool from "../tools/DrawingTool";
import FogTool from "../tools/FogTool";
import MeasureTool from "../tools/MeasureTool";
import NetworkedMapPointer from "../../network/NetworkedMapPointer";

import { useSettings } from "../../contexts/SettingsContext";
import { useUserId } from "../../contexts/UserIdContext";
import { usePermissoes } from "../../contexts/PermissoesContext";

import Action from "../../actions/Action";
import {
  AddStatesAction,
  CutFogAction,
  EditStatesAction,
  RemoveStatesAction,
} from "../../actions";

import Session from "../../network/Session";

import { Drawing, DrawingState } from "../../types/Drawing";
import { Fog, FogState } from "../../types/Fog";
import { Map as MapType, MapToolId } from "../../types/Map";
import { MapState } from "../../types/MapState";
import { Settings } from "../../types/Settings";
import {
  MapChangeEventHandler,
  MapResetEventHandler,
  TokenStateRemoveHandler,
  NoteChangeEventHandler,
  NoteRemoveEventHander,
  TokenStateChangeEventHandler,
  NoteCreateEventHander,
  SelectionItemsChangeEventHandler,
  SelectionItemsRemoveEventHandler,
  SelectionItemsCreateEventHandler,
  TokensStateCreateHandler,
} from "../../types/Events";

import useMapTokens from "../../hooks/useMapTokens";
import useMapNotes from "../../hooks/useMapNotes";
import { MapActions } from "../../hooks/useMapActions";
import useMapSelection from "../../hooks/useMapSelection";

type MapProps = {
  map: MapType | null;
  mapState: MapState | null;
  mapActions: MapActions;
  onMapTokenStateChange: TokenStateChangeEventHandler;
  onMapTokenStateRemove: TokenStateRemoveHandler;
  onMapTokensStateCreate: TokensStateCreateHandler;
  onSelectionItemsChange: SelectionItemsChangeEventHandler;
  onSelectionItemsRemove: SelectionItemsRemoveEventHandler;
  onSelectionItemsCreate: SelectionItemsCreateEventHandler;
  onMapChange: MapChangeEventHandler;
  onMapReset: MapResetEventHandler;
  onMapDraw: (action: Action<DrawingState>) => void;
  onFogDraw: (action: Action<FogState>) => void;
  onMapNoteCreate: NoteCreateEventHander;
  onMapNoteChange: NoteChangeEventHandler;
  onMapNoteRemove: NoteRemoveEventHander;
  allowMapChange: boolean;
  session: Session;
  onUndo: () => void;
  onRedo: () => void;
};

function Map({
  map,
  mapState,
  mapActions,
  onMapTokenStateChange,
  onMapTokenStateRemove,
  onMapTokensStateCreate,
  onSelectionItemsChange,
  onSelectionItemsRemove,
  onSelectionItemsCreate,
  onMapChange,
  onMapReset,
  onMapDraw,
  onFogDraw,
  onMapNoteCreate,
  onMapNoteChange,
  onMapNoteRemove,
  allowMapChange,
  session,
  onUndo,
  onRedo,
}: MapProps) {
  const { addToast } = useToasts();

  const userId = useUserId();
  const mestreId = useMestreId();
  const { canEditGrid } = usePermissoes();

  const [selectedToolId, setSelectedToolId] = useState<MapToolId>("move");
  const { settings, setSettings } = useSettings();

  const isMapOwner = map?.owner === mestreId;
  const hasEditPermission = isMapOwner || canEditGrid();

  function handleToolSettingChange(change: Partial<Settings>) {
    setSettings((prevSettings) => ({
      ...prevSettings,
      ...change,
    }));
  }

  const drawShapes = Object.values(mapState?.drawings || {});
  const fogShapes = Object.values(mapState?.fogs || {});

  function handleToolAction(action: string) {
    if (!hasEditPermission) {
      console.warn("⚠️ Sem permissão para executar ação:", action);
      return;
    }
    if (action === "eraseAll") {
      onMapDraw(new RemoveStatesAction(drawShapes.map((s) => s.id)));
    }
  }

  function handleMapShapeAdd(shape: Drawing) {
    if (!hasEditPermission) {
      console.warn("⚠️ Sem permissão para adicionar desenho");
      return;
    }
    onMapDraw(new AddStatesAction([shape]));
  }

  function handleMapShapesRemove(shapeIds: string[]) {
    if (!hasEditPermission) {
      console.warn("⚠️ Sem permissão para remover desenho");
      return;
    }
    onMapDraw(new RemoveStatesAction(shapeIds));
  }

  function handleFogShapesAdd(shapes: Fog[]) {
    if (!hasEditPermission) {
      console.warn("⚠️ Sem permissão para adicionar fog");
      return;
    }
    onFogDraw(new AddStatesAction(shapes));
  }

  function handleFogShapesCut(shapes: Fog[]) {
    if (!hasEditPermission) {
      console.warn("⚠️ Sem permissão para cortar fog");
      return;
    }
    onFogDraw(new CutFogAction(shapes));
  }

  function handleFogShapesRemove(shapeIds: string[]) {
    if (!hasEditPermission) {
      console.warn("⚠️ Sem permissão para remover fog");
      return;
    }
    onFogDraw(new RemoveStatesAction(shapeIds));
  }

  function handleFogShapesEdit(shapes: Partial<Fog>[]) {
    if (!hasEditPermission) {
      console.warn("⚠️ Sem permissão para editar fog");
      return;
    }
    onFogDraw(new EditStatesAction(shapes));
  }

  const { tokens, propTokens, tokenMenu, tokenDragOverlay } = useMapTokens(
    map,
    mapState,
    onMapTokenStateChange,
    onMapTokenStateRemove,
    onMapTokensStateCreate,
    selectedToolId
  );

  const { notes, noteMenu, noteDragOverlay } = useMapNotes(
    map,
    mapState,
    onMapNoteCreate,
    onMapNoteChange,
    onMapNoteRemove,
    selectedToolId
  );

  const { selectionTool, selectionMenu, selectionDragOverlay } =
    useMapSelection(
      map,
      mapState,
      onSelectionItemsChange,
      onSelectionItemsRemove,
      onSelectionItemsCreate,
      selectedToolId,
      settings.select
    );

  // Determinar se fog é editável
  const isFogEditable =
    !!(map?.owner === userId || mapState?.editFlags.includes("fog")) &&
    !settings.fog.preview &&
    hasEditPermission;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <MapInteraction
        map={map}
        mapState={mapState}
        controls={
          <>
            <MapControls
              onMapChange={onMapChange}
              onMapReset={onMapReset}
              map={map}
              mapState={mapState}
              mapActions={mapActions}
              allowMapChange={allowMapChange}
              onSelectedToolChange={setSelectedToolId}
              selectedToolId={selectedToolId}
              toolSettings={settings}
              onToolSettingChange={handleToolSettingChange}
              onToolAction={handleToolAction}
              onUndo={onUndo}
              onRedo={onRedo}
            />
            {tokenMenu}
            {noteMenu}
            {selectionMenu}
            {tokenDragOverlay}
            {noteDragOverlay}
            {selectionDragOverlay}
          </>
        }
        selectedToolId={selectedToolId}
        onSelectedToolChange={setSelectedToolId}
      >
        {map && map.showGrid && <MapGrid map={map} />}
        {propTokens}
        <DrawingTool
          map={map}
          drawings={drawShapes}
          onDrawingAdd={handleMapShapeAdd}
          onDrawingsRemove={handleMapShapesRemove}
          active={selectedToolId === "drawing" && hasEditPermission}
          toolSettings={settings.drawing}
        />
        {notes}
        {tokens}
        <FogTool
          map={map}
          shapes={fogShapes}
          onShapesAdd={handleFogShapesAdd}
          onShapesCut={handleFogShapesCut}
          onShapesRemove={handleFogShapesRemove}
          onShapesEdit={handleFogShapesEdit}
          onShapeError={addToast}
          active={selectedToolId === "fog" && hasEditPermission}
          toolSettings={settings.fog}
          editable={isFogEditable}
        />
        <NetworkedMapPointer
          active={selectedToolId === "pointer"}
          session={session}
        />
        <MeasureTool map={map} active={selectedToolId === "measure"} />
        {selectionTool}
      </MapInteraction>
    </Box>
  );
}

export default Map;