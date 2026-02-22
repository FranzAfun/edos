import AppRouter from "./routes/AppRouter";
import DevRoleSwitcher from "./components/dev/DevRoleSwitcher";

function App() {
  return (
    <>
      <AppRouter />
      <DevRoleSwitcher />
    </>
  );
}

export default App;
