const loader = {
	open: true,
	toggle: () =>
	{
		if (loader.open)
		{
			$("#loadingScreen").hide();
		} else
		{
			$("#loadingScreen").show();
		}

		loader.open = !loader.open;
	},
}