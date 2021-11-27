/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

import ReferencingForm from "components/referencing-form";

function App() {
  return (
    <div
      css={css`
        max-width: 600px;
        margin: 0 auto;
      `}
    >
      <ReferencingForm />
    </div>
  );
}

export default App;
