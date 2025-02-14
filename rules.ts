import fs from "fs";
import { KarabinerRules } from "./types";
import { createHyperSubLayers, app, open, deeplink } from "./utils";

const yabai = "/opt/homebrew/bin/yabai";
const jq = "/opt/homebrew/bin/jq";

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
  closeWindow: `
    # Get the ID of the currently focused window
    current_window_id=$(${yabai} -m query --windows --window | ${jq} -r '.id')

    # Close the currently focused window
    ${yabai} -m window --close "$current_window_id"

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

    # Press Escape Key
    osascript -e 'tell application "System Events" to key code 53'
  `,
  maximise: `open -g "rectangle-pro://execute-action?name=maximize"`,
  splitLeft: `open -g "rectangle-pro://execute-action?name=left-half"`,
  splitRight: `open -g "rectangle-pro://execute-action?name=right-half"`,
};

const rules: KarabinerRules[] = [
  {
    description: "Single keys",
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

      // option + p -> play/pause (using raycast://extensions/thomas/spotify-controls/playPause)
      {
        description: "Option Key + p -> play/pause",
        from: {
          key_code: "p",
          modifiers: {
            mandatory: ["option"],
          },
        },
        to: deeplink("raycast://extensions/thomas/spotify-controls/playPause")
          .to,
        type: "basic",
      },
      // option + [ -> previous track (using raycast://extensions/thomas/spotify-controls/previous)
      {
        description: "Option Key + [ -> previous track",
        from: {
          key_code: "open_bracket",
          modifiers: {
            mandatory: ["option"],
          },
        },
        to: deeplink(
          "raycast://extensions/thomas/spotify-controls/previousTrack"
        ).to,
        type: "basic",
      },
      // option + ] -> next track (using raycast://extensions/thomas/spotify-controls/nextTrack)
      {
        description: "Option Key + ] -> next track",
        from: {
          key_code: "close_bracket",
          modifiers: {
            mandatory: ["option"],
          },
        },
        to: deeplink("raycast://extensions/thomas/spotify-controls/nextTrack")
          .to,
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
      // HYPER + a === option + A (Open Raycast Quick AI)
      a: {
        to: [
          {
            key_code: "a",
            modifiers: ["option"],
          },
        ],
      },

      r: {
        g: deeplink("raycast://extensions/josephschmitt/gif-search/search"),
        c: deeplink("raycast://extensions/raycast/raycast/confetti"),
        m: open("raycast://extensions/raycast/system/open-camera"),
        o: deeplink("raycast://extensions/Aayush9029/cleanshotx/capture-text"),
      },

      q: deeplink("msteams://chats"),
      c: deeplink("msteams://calendar"),
      d: app("Wave"),
      x: app("Zen Browser"),
      e: app("Cursor"),
      1: app("1Password"),
      p: app("Spotify"),
      m: app("Thunderbird"),
      f: app("Finder"),

      semicolon: deeplink(
        "raycast://extensions/raycast/emoji-symbols/search-emoji-symbols"
      ),
      v: deeplink(
        "raycast://extensions/raycast/clipboard-history/clipboard-history"
      ),
      j: deeplink("raycast://extensions/raycast/raycast-ai/ai-chat"),
      t: deeplink("raycast://extensions/Keyruu/zen-browser/new-tab"),
      n: deeplink("raycast://extensions/raycast/raycast-notes/raycast-notes"),

      w: {
        q: {
          to: [
            {
              shell_command: scripts.closeWindow,
            },
          ],
        },
        r: {
          to: [
            {
              shell_command: `open -g "rectangle-pro://execute-action?name=tidy"`,
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
        n: app("Obsidian"),
        m: app("Mail"),
        f: app("ProFind"),
        p: app("Spotify"),
        t: app("Microsoft Teams"),
        w: app("WhatsApp"),
        s: app("Slack"),
        i: app("ClickUp"),
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
