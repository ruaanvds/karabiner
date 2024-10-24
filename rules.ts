import fs from "fs";
import { KarabinerRules } from "./types";
import {
  createHyperSubLayers,
  app,
  open,
  openLinkInChrome,
  createHyperSubLayer,
} from "./utils";

const yabai = "/opt/homebrew/bin/yabai";
const jq = "/opt/homebrew/bin/jq";

const scriptsDir = "/Users/ruaan/Dropbox/Dev/Raycast/Scripts";

const scripts = {
  minimise: `
             # Get the ID of the currently focused window
            current_window_id=$(${yabai} -m query --windows --window | ${jq} -r '.id')

            # Minimize the currently focused window
            ${yabai} -m window --minimize

            # Get the list of windows
            windows=$(${yabai} -m query --windows)

            # Find the next window to focus on
            next_window_id=$(echo "$windows" | ${jq} -r --arg current_window_id "$current_window_id" '
            .[] | select(.id != ($current_window_id | tonumber) and
                        (.["is-visible"] // false) == true and
                        (.["is-minimized"] // false) == false) | .id' | head -n 1)

            # Focus on the next window
            if [ -n "$next_window_id" ]; then
            ${yabai} -m window --focus "$next_window_id"
            else
            echo "No next window to focus on."
            fi
`,
  maximise: `open -g "rectangle-pro://execute-action?name=maximize"`,
  splitLeft: `open -g "rectangle-pro://execute-action?name=left-half"`,
  splitRight: `open -g "rectangle-pro://execute-action?name=right-half"`,
  appNextDisplay: `open -g "rectangle-pro://execute-action?name=app-next-display"`,
  appPrevDisplay: `open -g "rectangle-pro://execute-action?name=app-prev-display"`,
};

const shellCommands = {
  // yabai focus
  yabaiFocusUp: {
    to: [
      {
        shell_command: `${yabai} -m window --focus north`,
      },
    ],
  },
  yabaiFocusDown: {
    to: [
      {
        shell_command: `${yabai} -m window --focus south`,
      },
    ],
  },
  yabaiFocusLeft: {
    to: [
      {
        shell_command: `${yabai} -m window --focus west`,
      },
    ],
  },
  yabaiFocusRight: {
    to: [
      {
        shell_command: `${yabai} -m window --focus east`,
      },
    ],
  },
  yabaiToggleLayout: {
    to: [
      {
        shell_command: `${yabai} -m space --layout $(${yabai} -m query --spaces --space | ${jq} -r 'if .type == "bsp" then "float" else "bsp" end')`,
      },
    ],
  },

  yabaiToggleFullscreen: {
    to: [
      {
        shell_command: `${yabai} -m window --toggle zoom-fullscreen`,
      },
    ],
  },
  yabaiToggleFloat: {
    to: [
      {
        shell_command: `${yabai} -m window --toggle float`,
      },
    ],
  },
  yabaiSizeUp: {
    to: [
      {
        shell_command: `${yabai} -m window --resize right:20:0`,
      },
    ],
  },
  yabaiSizeDown: {
    to: [
      {
        shell_command: `${yabai} -m window --resize right:-20:0`,
      },
    ],
  },

  // yabai focus
  yabaiMoveUp: {
    to: [
      {
        shell_command: `${yabai} -m window --focus $(yabai -m query --windows | jq -r '.[] | select(.app == "Google Chrome") | .id')`,
      },
    ],
  },
  yabaiMoveDown: {
    to: [
      {
        shell_command: `${yabai} -m window --swap south || $(yabai -m window --display south; yabai -m display --focus south)`,
      },
    ],
  },
  yabaiMoveLeft: {
    to: [
      {
        shell_command: `${yabai} -m window --swap west || $(yabai -m window --display west; yabai -m display --focus west)`,
      },
    ],
  },
  yabaiMoveRight: {
    to: [
      {
        shell_command: `${yabai} -m window --swap east || $(yabai -m window --display east; yabai -m display --focus east)`,
      },
    ],
  },

  switchToSpace1: {
    to: [
      {
        shell_command: `osascript -e 'tell application "System Events" to key code 18 using {control down, shift down}'
`,
      },
    ],
  },
  switchToSpace2: {
    to: [
      {
        shell_command: `osascript -e 'tell application "System Events" to key code 19 using {control down, shift down}'
`,
      },
    ],
  },
  switchToSpace3: {
    to: [
      {
        shell_command: `osascript -e 'tell application "System Events" to key code 20 using {control down, shift down}'
`,
      },
    ],
  },
};

const rules: KarabinerRules[] = [
  {
    description: "Option Key Held In",
    manipulators: [
      {
        description: "Option Key + = -> increase volume",
        from: {
          key_code: "equal_sign",
          modifiers: {
            mandatory: ["option"],
          },
        },
        to: [
          {
            key_code: "volume_up",
          },
        ],
        type: "basic",
      },
      {
        description: "Option Key + - -> increase volume",
        from: {
          key_code: "hyphen",
          modifiers: {
            mandatory: ["option"],
          },
        },
        to: [
          {
            key_code: "volume_down",
          },
        ],
        type: "basic",
      },
    ],
  },

  // Define the Hyper key itself
  {
    description: "Hyper Key (⌃⌥⇧⌘)",
    manipulators: [
      {
        description: "Caps Lock -> Hyper Key",
        from: {
          key_code: "caps_lock",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [
          {
            set_variable: {
              name: "hyper",
              value: 1,
            },
          },
        ],
        to_after_key_up: [
          {
            set_variable: {
              name: "hyper",
              value: 0,
            },
          },
        ],
        type: "basic",
      },
    ],
  },
  ...createHyperSubLayers(
    {
      /**
       * Window Management
       */
      // space

      1: shellCommands.switchToSpace1,
      2: shellCommands.switchToSpace2,
      3: shellCommands.switchToSpace3,

      s: {
        to: [
          {
            shell_command: `${yabai} -m window --toggle zoom-fullscreen`,
          },
        ],
      },
      d: {
        to: [
          {
            shell_command: `~/Dropbox/Dev/Raycast/Scripts/yabai/toggle-window-floating-tiling.sh`,
          },
        ],
      },

      semicolon: open(
        "raycast://extensions/raycast/emoji-symbols/search-emoji-symbols"
      ),
      c: open(
        "raycast://extensions/raycast/clipboard-history/clipboard-history"
      ),
      q: {
        t: open("raycast://extensions/appest/ticktick/create"),
      },
      g: open("raycast://extensions/josephschmitt/gif-search/search"),
      j: open("raycast://extensions/raycast/raycast-ai/ai-chat"),

      z: app("WezTerm"),
      x: app("Arc"),
      e: app("Visual Studio Code"),
      t: {
        to: [
          {
            shell_command: `osascript -e 'tell application "Arc" to activate' -e 'delay 1' -e 'tell application "System Events" to keystroke "t" using {command down}'`,
          },
        ],
      },
      p: app("1Password"),

      w: {
        r: {
          to: [
            {
              shell_command: `open -g "rectangle-pro://execute-action?name=restore"`,
            },
          ],
        },
        t: {
          to: [
            {
              shell_command: `open -g "rectangle-pro://execute-action?name=tidy"`,
            },
          ],
        },
        open_bracket: {
          to: [
            {
              shell_command: scripts.appPrevDisplay,
            },
          ],
        },
        close_bracket: {
          to: [
            {
              shell_command: scripts.appNextDisplay,
            },
          ],
        },
        up_arrow: {
          to: [
            {
              shell_command: scripts.maximise,
            },
          ],
        },
        down_arrow: {
          to: [
            {
              shell_command: scripts.minimise,
            },
          ],
        },
        right_arrow: {
          to: [
            {
              shell_command: scripts.splitRight,
            },
          ],
        },
        left_arrow: {
          to: [
            {
              shell_command: scripts.splitLeft,
            },
          ],
        },
      },
      // open apps
      o: {
        n: app("Obsidian"), // Notes
        m: app("Mail"), // Mail
        f: app("QSpace"), // Finder
        p: app("Spotify"), // Apple Music
        t: app("Microsoft Teams"), // y = Messaging
        w: app("WhatsApp"), // WhatsApp
        s: app("Slack"), // sLack
        i: app("ClickUp"), // ClickUp
        c: app("Microsoft Outlook"),
      },
    },
    {}
  ),
];

fs.writeFileSync(
  "karabiner.json",
  JSON.stringify(
    {
      global: {
        show_in_menu_bar: false,
      },
      profiles: [
        {
          name: "Default",
          complex_modifications: {
            rules,
          },
        },
      ],
    },
    null,
    2
  )
);
