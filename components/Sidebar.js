import React from "react";
import classnames from "classnames";
import { ChevronRight, ChevronLeft } from "react-feather";

import styles from "./Sidebar.module.css";

function Sidebar({ children }) {
  const [open, setOpen] = React.useState(false);

  const toggle = e => {
    e.preventDefault();
    setOpen(!open);
  };

  return (
    <div className={classnames(styles.sidebar, { [styles.open]: open })}>
      <div className={styles.toggle} onClick={toggle}>
        {open ? <ChevronLeft /> : <ChevronRight />}
      </div>
      {open ? <div className={styles.content}>{children}</div> : null}
    </div>
  );
}

export default Sidebar;
