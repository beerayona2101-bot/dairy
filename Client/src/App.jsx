// MADHU Dairy - Palette & UI Modernization Enforced
import Routers from "./routes/Routers";
import "./index.css";
import { SnackbarProvider } from "notistack";

import ConnectionStatusIndicator from "./components/Common/ConnectionStatusIndicator";

function App() {
  return (
    <SnackbarProvider
      maxSnack={1}
      preventDuplicate
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      autoHideDuration={2000}
    >
      <Routers />
      <ConnectionStatusIndicator />
    </SnackbarProvider>
  );
}

export default App;
