var menu = function(options, callbacks) {
	var binded = false;
	var menuOpened = false;

	var showMenu = function() {
		var cheatMenuContainer = document.createElement('div');
		cheatMenuContainer.className = "modal-body";
		cheatMenuContainer.style = "display:block;z-index:10;pointer-events:all;position:absolute;max-height:500px;width:25%;"

		var particlesTransparencySlider = document.createElement('div');
		var ceilingTrancparencySlider = document.createElement('div');

		var fragGernageColorSlider = document.createElement('div');
		var fragGernageSizeSlider = document.createElement('div');

		var autoAimEnabledCheckbox = document.createElement('div');
		var autoLootEnabledCheckbox = document.createElement('div');
		var autoOpeningDoorsEnabledCheckbox = document.createElement('div');
		var zoomRadiusManagerEnabledCheckbox = document.createElement('div');

		if(callbacks.particlesTransparencyCb) {
			particlesTransparencySlider.className = "modal-settings-item slider-container";

			var description = document.createElement('p');
			description.className = "slider-text";
			description.innerHTML = "Particles transparency level";

			var input = document.createElement('input');
			input.className = "slider";
			input.type = "range";
			input.min = "0";
			input.max = "1";
			input.step = "0.01";
			input.value = options.particlesTransparency;

			input.addEventListener("input", function() {
				callbacks.particlesTransparencyCb(this.value);
			}, false);

			particlesTransparencySlider.appendChild(description);
			particlesTransparencySlider.appendChild(input);
		}

		if(callbacks.ceilingTrancparencyCb) {
			ceilingTrancparencySlider.className = "modal-settings-item slider-container";

			var description = document.createElement('p');
			description.className = "slider-text";
			description.innerHTML = "Ceiling transparency level";

			var input = document.createElement('input');
			input.className = "slider";
			input.type = "range";
			input.min = "0";
			input.max = "1";
			input.step = "0.01";
			input.value = options.ceilingTrancparency;

			input.addEventListener("input", function() {
				callbacks.ceilingTrancparencyCb(this.value);
			}, false);

			ceilingTrancparencySlider.appendChild(description);
			ceilingTrancparencySlider.appendChild(input);
		}

		if(callbacks.gernagePropertiesCb) {
			fragGernageColorSlider.className = "modal-settings-item slider-container";
			fragGernageSizeSlider.className = "modal-settings-item slider-container";

			var colorDescription = document.createElement('p');
			var sizeDescription = document.createElement('p');

			colorDescription.className = "slider-text";
			colorDescription.innerHTML = "Gernage color";

			sizeDescription.className = "slider-text";
			sizeDescription.innerHTML = "Gernage size";

			var inputColor = document.createElement('input');
			var inputSize = document.createElement('input');

			inputColor.className = "slider";
			inputColor.type = "range";
			inputColor.min = "0";
			inputColor.max = "16777216";
			inputColor.step = "1";
			inputColor.value = options.fragGernageColor;

			inputSize.className = "slider";
			inputSize.type = "range";
			inputSize.min = "0.1";
			inputSize.max = "0.5";
			inputSize.step = "0.01";
			inputSize.value = options.fragGernageSize;

			inputColor.addEventListener("input", function() {
				callbacks.gernagePropertiesCb(options.fragGernageColor, this.value);
			}, false);

			inputSize.addEventListener("input", function() {
				callbacks.gernagePropertiesCb(this.value, options.fragGernageSize);
			}, false);

			fragGernageColorSlider.appendChild(colorDescription);
			fragGernageColorSlider.appendChild(inputColor);

			fragGernageSizeSlider.appendChild(sizeDescription);
			fragGernageSizeSlider.appendChild(inputSize);
		}

		if(callbacks.autoAimEnableCb) {
			var description = document.createElement('p');
			description.className = "modal-settings-checkbox-text";
			description.innerHTML = "Auto aim enabled";

			var input = document.createElement('input');
			input.type = "checkbox";
			input.checked = options.autoAimEnabled;

			input.addEventListener("change", function() {
				callbacks.autoAimEnableCb();
				this.checked = options.autoAimEnabled;
			}, false);

			autoAimEnabledCheckbox.appendChild(description);
			autoAimEnabledCheckbox.appendChild(input);
		}

		if(callbacks.autoLootEnableCb) {
			var description = document.createElement('p');
			description.className = "modal-settings-checkbox-text";
			description.innerHTML = "Auto loot enabled";

			var input = document.createElement('input');
			input.type = "checkbox";
			input.checked = options.autoLootEnabled;

			input.addEventListener("change", function() {
				callbacks.autoLootEnableCb();
				this.checked = options.autoLootEnabled;
			}, false);

			autoLootEnabledCheckbox.appendChild(description);
			autoLootEnabledCheckbox.appendChild(input);
		}

		if(callbacks.autoOpeningDoorsEnableCb) {
			var description = document.createElement('p');
			description.className = "modal-settings-checkbox-text";
			description.innerHTML = "Auto opening doors enabled";

			var input = document.createElement('input');
			input.type = "checkbox";
			input.checked = options.autoOpeningDoorsEnabled;

			input.addEventListener("change", function() {
				callbacks.autoOpeningDoorsEnableCb();
				this.checked = options.autoOpeningDoorsEnabled;
			}, false);

			autoOpeningDoorsEnabledCheckbox.appendChild(description);
			autoOpeningDoorsEnabledCheckbox.appendChild(input);
		}

		if(callbacks.zoomRadiusManagerEnableCb) {
			var description = document.createElement('p');
			description.className = "modal-settings-checkbox-text";
			description.innerHTML = "Zoom changing enabled";

			var input = document.createElement('input');
			input.type = "checkbox";
			input.checked = options.zoomRadiusManagerEnabled;

			input.addEventListener("change", function() {
				callbacks.zoomRadiusManagerEnableCb();
				this.checked = options.zoomRadiusManagerEnabled;
			}, false);

			zoomRadiusManagerEnabledCheckbox.appendChild(description);
			zoomRadiusManagerEnabledCheckbox.appendChild(input);
		}

		cheatMenuContainer.appendChild(particlesTransparencySlider);
		cheatMenuContainer.appendChild(ceilingTrancparencySlider);

		cheatMenuContainer.appendChild(fragGernageColorSlider);
		cheatMenuContainer.appendChild(fragGernageSizeSlider);

		cheatMenuContainer.appendChild(autoAimEnabledCheckbox);
		cheatMenuContainer.appendChild(autoLootEnabledCheckbox);
		cheatMenuContainer.appendChild(autoOpeningDoorsEnabledCheckbox);
		cheatMenuContainer.appendChild(zoomRadiusManagerEnabledCheckbox);

		document.getElementById('ui-game').appendChild(cheatMenuContainer);
	}

	var hideMenu = function() {
		document.getElementById('ui-game').removeChild(document.getElementById('ui-game').lastChild);
		cheatMenuContainer = document.createElement('div');
	}

	var escListener = {
		keyup: function(e) {
			if(event.which == 27) {
				menuOpened = !menuOpened;
				if(menuOpened) {
					showMenu();
				} else {
					hideMenu();
				}
			}
		}
	}

	var addEscListener = function() {
		window.addEventListener("keyup", escListener.keyup);
	}

	var removeEscListener = function() {
		window.removeEventListener("keyup", escListener.keyup);
	}

	var bind = function() {
		removeEscListener();
		addEscListener();
		binded = true;
	}

	var unbind = function() {
		if(menuOpened) {
			hideMenu();
			menuOpened = false;
		}

		removeEscListener();
		binded = false;
	}

	var isBinded = function() {
		return binded;
	}

	return {
		bind: bind,
		unbind: unbind,
		isBinded: isBinded
	}
}