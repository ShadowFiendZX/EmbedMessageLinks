/**
 * @name EmbedMessageLinks
 * @author ShadowFiendZX
 * @description Embeds Discord message links into the chat.
 * @version 0.0.1
 */

// #region Modules

const EventEmitter = BdApi.Webpack.getModule(result => result.EventEmitter);

// #endregion

// #region EmbeddedMessageCache

class EmbeddedMessageCache extends EventEmitter
{

	// #region Nested Types

	// #region Event

	Event = Enum
	(
		"MESSAGE_UPDATE",
		"SETTINGS_UPDATE"
	);

	// #endregion

	// #endregion

	// #region Constructor

	constructor()
	{
		// The fact that this isn't base is painful.
		super();
		this.setMaxListeners(Infinity);
	};

	// #endregion

};

// #endregion

module.exports = !global.ZeresPluginLibrary ?
class EmbedMessageLinks
{
	start()
	{
		BdApi.showConfirmationModal
		(
			"Library Missing",
			"ZeresPluginLibrary is missing. This library is needed to EmbedMessageLinks. Please click \"Download Now\" to intall it.",
			{
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: () =>
				{
					require("request").get
					(
						"https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
						async (error, response, body) =>
						{
							if (error)
							{
								// Direct link to download the js file if accessing the GitHub link errored.
								return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
							}

							await new Promise(value => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, value));
						}
					);
				}
			}
		);
	}

	stop()
	{
	}
} :
class EmbedMessageLinks
{

	// #region Instance Fields

	#m_Active = false;
	#m_HasTheme = false;
	#m_MessageContextMenuModule = null;
	// #endregion

	// #region Methods

	// #region checkIfThemeIsEnabled

	checkIfThemeIsEnabled()
	{
		for (let theme of BdApi.Themes.getAll())
		{
			if (BdApi.Themes.isEnabled(theme.name))
			{
				this.#m_HasTheme = true;

				return;
			}
		}

		this.#m_HasTheme = false;
	}

	// #endregion

	// #region start

	start()
	{
		this.#m_Active = true;

		this.checkIfThemeIsEnabled();

		BdApi.Webpack.waitForModule
		(
			result => result.displayName && result.displayName === "MessageContextMenu"
		).then(result => this.#m_MessageContextMenuModule = result);

	}

	// #endregion

	// #region stop

	stop()
	{
		this.#m_Active = false;
	}

	// #endregion

	// #region observer

	observer(changes)
	{
		if (this.#m_Active === true)
		{
			if (changes)
			{
				let themeChanged = false;

				if (changes.addedNodes && changes.addedNodes.length > 0)
				{
					const length = changes.addedNodes.length;

					for (let i_AddedNodes = 0; i_AddedNodes < length; ++i_AddedNodes)
					{
						if
						(
							changes.addedNodes[i_AddedNodes].parentNode
							&& changes.addedNodes[i_AddedNodes].parentNode.nodeName == "BD-THEMES"
							&& changes.addedNodes[i_AddedNodes].nodeName
							&& changes.addedNodes[i_AddedNodes].nodeName === "STYLE"
						)
						{
							themeChanged = true;

							break;
						}
					}
				}

				if (changes.removedNodes && changes.removedNodes.length > 0 && themeChanged === false)
				{
					const length = changes.removedNodes.length;

					for (let i_RemovedNodes = 0; i_RemovedNodes < length; ++i_RemovedNodes)
					{
						if
						(
							// For some reaon when removed, parentNode isn't set like it is when added.
							changes.removedNodes[i_RemovedNodes].nodeName
							&& changes.removedNodes[i_RemovedNodes].nodeName === "STYLE"
						)
						{
							themeChanged = true;

							break;
						}
					}
				}

				if (themeChanged)
				{
					this.checkIfThemeIsEnabled();
				}
			}
		}
	}

	// #endregion

	// #endregion

};
