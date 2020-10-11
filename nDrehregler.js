

	/* 
	 * Drehregler
	 * ----------
	 * 
	 * Script:        nDrehregler
	 * 
	 * Version:       1.1
	 * Release:       01.05.2020
	 * 
	 * Author:        numaek   
	 * Copyright (c): 2004-2020 by www.numaek.de
	 * 
	 * *************************************************************************************************************************************************************************************
	 */


	function Drehregler(ID)
	{
		/*
		 * 
		 * Im HTML - die Canvas-Fläche darstellen, mit ID und Abmessungen:
		 * ===============================================================
		 * <canvas id="DR_1" width="120" height="120" style="border: 0px solid #808080;"></canvas>
		 * 
		 * 
		 * Im Javascript - den Regler parametrieren:
		 * =========================================
		 * meinRegler = new Drehregler('DR_1');			// Neuen Regler vorbereiten
		 * 
		 * meinRegler.configSet('start',       50);		// Konfiguration bearbeiten (Liste siehe unten)
		 * meinRegler.configSet('ring_farbe', 'red');		// Konfiguration bearbeiten, etc...
		 * meinRegler.configSet('stufen',     '0|Off');		// Stufenregler: Stufe hinzufügen
		 * meinRegler.configSet('stufen',     '20|Low');	// Stufenregler: Stufe hinzufügen
		 * meinRegler.configSet('stufen',     '50|Mid');	// Stufenregler: Stufe hinzufügen
		 * meinRegler.configSet('stufen',     '70|High');	// Stufenregler: Stufe hinzufügen
		 * meinRegler.configSet('stufen',     '100|Over');	// Stufenregler: Stufe hinzufügen
		 * 
		 * meinRegler.init();					// Regler laden und anzeigen
		 * 
		 * 
		 * Im Javascript - verfügbare Methoden:
		 * ------------------------------------
		 * meinRegler.init();					// Lädt und stellt den Regler mit der aktuelle KOnfiguration dar
		 * meinRegler.set(stellung);				// Den Regler auf eine Stellung setzen
		 * meinRegler.reset();					// Den Regler auf den Startwert zurücksetzen
		 * meinRegler.configSet(name, value);			// Überschreibt die Standard-Konfiguration
		 * meinRegler.configGet(name);				// Liest die aktuelle Konfiguration eines Parameters aus
		 * meinRegler.log();					// Zeigt die Daten des Regler-Objekts in der Konsole (F12) an
		 * 
		 * 
		 */


		// Standard-Konfiguration
		// ======================
		this.config = [];
		this.config['steuerung']     = 0;			// 0(Mausverfolgung), 1(Up-Down)
		this.config['min']           = 0;			//   0 = SSW
		this.config['max']           = 270;			// 270 = SSO
		this.config['wert_verlauf']  = 0;			// 0(linear), 1(exponentiell progressiv), -1(exponentiell degressiv)
		this.config['radius']        = 20;			// Radius des Knopfes
		this.config['mitte']         = 0;			// Mittelstellung
		this.config['start']         = 0;			// Startwinkel in %
		this.config['schritte']      = 4;			// Schrittweite in % bei Drehung bei Up-Down-Steuerung
		this.config['impuls']        = 0;			// Regler im Endlos-Modus betreiben
		this.config['impuls_kreis']  = 25;			// Impulse pro Umdrehung (Z.B. 4% / U)
		this.config['farbe_hinter']  = '#BCBCBC';		// Hintergrundfarbe der Zeichenfläche, '' = keine

		this.config['knopf_optik']   = 1;			// 0(keine), 1(Farbverlauf von 'farbe_1' nach 'farbe_2'), 2(Metall)
		this.config['Knopf_farbe_1'] = '#DCDCDC';		// Farbe oben  vom Farbverlauf
		this.config['Knopf_farbe_2'] = '#505050';		// Farbe unten vom Farbverlauf

		this.config['knebel']        = 0;			// Knebel zeichnen
		this.config['knebel_farbe']  = '#505050';		// Farbe Knebel

		this.config['punkt']         = 'strich';		// 'punkt' oder 'strich', '' = keiner
		this.config['punkt_farbe']   = '#00FFFF';		// Farbe des Punktes

		this.config['skala']         = 1;			// 0(keine), 1(1 bis 10), 2(-5 bis +5), 3(-10 bis 0), 4(0,5 bis 2)
		this.config['skala_striche'] = 0;			// Skalenstriche zeichnen
		this.config['skala_alle']    = 1;			// 0(keine), 1(Alle 11 Werte), 2(Start, Mitte & Ende), 3(Start & Ende)
		this.config['skala_farbe']   = '#FFFFFF';		// SChriftfarbe der Skala

		this.config['ring']          = 1;			// 0(keiner), 1(aktiv), 2(dauer-an), 3(dauer-an Vollkreis)
		this.config['ring_breite']   = 4;			// Ringstärke, negativ = dicker werdend, z.B. -8
		this.config['ring_farbe']    = 'orange';		// Farbe des Rings 'rainbow' = Regenbogenfarben, sonst z.B. '#00FFFF'
		this.config['ring_hinter']   = 1;			// 0(keiner), 1(wie Vordergrund), 2(dauer-an Vollkreis)
		this.config['ring_hinter_f'] = '#505050';		// Farbe des Hintergrund-Rings

		this.config['stufen']        = [];			// Stufenstellungen in %


		// #############################################################################################################################################################################
		// Hilfsfunktionen


		var thisData;
		var nDrCvDrag     = -1;
		var nDrCvDragX    = 0;
		var nDrCvDragY    = 0;
		var nDrCvPosX     = 0;
		var nDrCvPosY     = 0;
		var nDrCvRadius   = 0;
		var useDrcvPROZ   = 0;
		var useDrcvTitle  = '';


		this.configSet = function(name, value)
		{
			if( typeof(this.config[name]) !== 'undefined' )
			{
				if( name == 'stufen' )
				{
					this.config[name].push(value);
				} else
				  {
					this.config[name] = value;
				  }
			}
		};


		this.configGet = function(name)
		{
			if( typeof(this.config[name]) !== 'undefined' )
			{
				return this.config[name];
			} else
			  {
				return '?';
			  }
		};


		this.log = function()
		{
			console.log( this );
		};


		this.nGetPosAbs = function(element)
		{
			var top  = 0;
			var left = 0;

			while(element)
			{
				top    += element.offsetTop  || 0;
				left   += element.offsetLeft || 0;
				element = element.offsetParent;
			}

			return {
				top:  top,
				left: left
			};
		};


		this.nRadialToGrad = function(bogen)
		{
			grad  = bogen * 360 / ( 2 * Math.PI );
			return grad;
		};


		this.nGradToRadial = function(grad)
		{
			bogen = grad * ( 2 * Math.PI ) / 360;
			return bogen;
		};


		this.nProzentToRadial = function(drcvID, drcvPROZ)
		{
			if( drcvPROZ <   0 ) { drcvPROZ =   0; }
			if( drcvPROZ > 100 ) { drcvPROZ = 100; }
			bogenWinkel  = 135 + this.config['min'] + ( ( this.config['max'] - this.config['min'] ) * ( drcvPROZ / 100 ) );
			return this.nGradToRadial(bogenWinkel);
		};


		this.nRadialToSinus = function(radial, range)
		{
			useRadius = nDrCvRadius * range;
			return ( Math.sin(radial) * useRadius );
		};


		this.nRadialToCosinus = function(radial, range)
		{
			useRadius = nDrCvRadius * range;
			return ( Math.cos(radial) * useRadius );
		};


		this.percentToExSlow = function(percent)
		{
			expValue = ( percent ==   0 ) ? 0 : Math.pow(10,     ( percent * 0.02 ) );
			expValue = Math.round( ( expValue * 100 ) ) / 100;
			return expValue;
		}


		this.percentToExFast = function(percent)
		{
			expValue = ( percent == 100 ) ? 0 : Math.pow(10, 2 - ( percent * 0.02 ) );
			expValue = 100 - expValue;
			expValue = Math.round( ( expValue * 100 ) ) / 100;
			return expValue;
		}


		this.nGetRainbow = function(aPro)
		{
			if( aPro < 20 )
			{
				step = Math.ceil( 255 * ( ( aPro -  4 ) / 16 ) );
				chR  = 255;
				chG  = step;
				chB  = 0;
			}
			if( aPro >= 20 && aPro < 36 )
			{
				step = Math.ceil( 255 * ( ( aPro - 20 ) / 16 ) );
				chR  = 255 - step;
				chG  = 255;
				chB  = 0;
			}
			if( aPro >= 36 && aPro < 52 )
			{
				step = Math.ceil( 255 * ( ( aPro - 36 ) / 16 ) );
				chR  = 0;
				chG  = 255;
				chB  = step;
			}
			if( aPro >= 52 && aPro < 68 )
			{
				step = Math.ceil( 255 * ( ( aPro - 52 ) / 16 ) );
				chR  = 0;
				chG  = 255 - step;
				chB  = 255;
			}
			if( aPro >= 68 && aPro < 84 )
			{
				step = Math.ceil( 255 * ( ( aPro - 68 ) / 16 ) );
				chR  = step;
				chG  = 0;
				chB  = 255;
			}
			if( aPro >= 84 )
			{
				step = Math.ceil( 255 * ( ( aPro - 84 ) / 16 ) );
				chR  = 255;
				chG  = 0;
				chB  = 255 - step;
			}

			chR = ( chR <   0 ) ?   0 : chR;
			chG = ( chG <   0 ) ?   0 : chG;
			chB = ( chB <   0 ) ?   0 : chB;

			chR = ( chR > 255 ) ? 255 : chR;
			chG = ( chG > 255 ) ? 255 : chG;
			chB = ( chB > 255 ) ? 255 : chB;

			return 'rgb('+chR+','+chG+','+chB+')';
		}


		// =============================================================================================================================================================================
		// Eventhandler


		this.reset = function(event)
		{
			if( thisData.config['impuls'] == 0 )
			{
				thisData.set(thisData.config['start']);
			}
		};


		this.mouseDown = function(event)
		{
			nDrCvDrag  = ID;
			nDrCvDragX = -1;
			nDrCvDragY = -1;

			absPos     = thisData.nGetPosAbs( document.getElementById(ID) );
			nDrCvPosX  = absPos.left + ( thisData.config['width']  / 2 );
			nDrCvPosY  = absPos.top  + ( thisData.config['height'] / 2 );

			if( thisData.config['steuerung'] == 0 )
			{
				document.getElementById(ID).style.cursor = 'grabbing';
				document.body.style.cursor               = 'grabbing';
			} else
			  {
				document.getElementById(ID).style.cursor = 'n-resize';
				document.body.style.cursor               = 'n-resize';
			  }
		}


		this.mouseUp = function(event)
		{
			if( nDrCvDrag != -1 )
			{
				if( ( thisData.config['stufen'].length > 0 ) )
				{
					thisData.stellung = useDrcvPROZ;

					// Title mit Stufentext überschreiben
					document.getElementById(ID).title = ( useDrcvTitle != '' ) ? useDrcvTitle : useDrcvPROZ + '%';
				}

				nDrCvDrag = -1;

				document.getElementById(ID).style.cursor = 'grab';
				document.body.style.cursor               = 'default';
			}
		}


		this.mouseMove = function(event)
		{
			x = event.clientX + window.pageXOffset;
			y = event.clientY + window.pageYOffset;

			if( nDrCvDrag != -1 )
			{
				if( thisData.config['steuerung'] == 0 )
				{
					// Mausverfolgung
					if( ( x - nDrCvPosX ) >= 0 && ( y - nDrCvPosY ) <  0 )
					{
						// Quadrant 1
						nDrQu = 1;
						nDrAb = Math.atan( (nDrCvPosY-y) / (x-nDrCvPosX) );
					} else
					if( ( x - nDrCvPosX ) <  0 && ( y - nDrCvPosY ) <  0 )
					{
						// Quadrant 2
						nDrQu = 2;
						nDrAb = Math.atan( (nDrCvPosX-x) / (nDrCvPosY-y) );
					} else
					if( ( x - nDrCvPosX ) <  0 && ( y - nDrCvPosY ) >= 0 )
					{
						// Quadrant 3
						nDrQu = 3;
						nDrAb = Math.atan( (y-nDrCvPosY) / (nDrCvPosX-x) );
					} else
					  {
						// Quadrant 4
						nDrQu = 4;
						nDrAb = Math.atan( (x-nDrCvPosX) / (y-nDrCvPosY) );
					  }

					nDrAb      += ( nDrQu - 1 ) * ( Math.PI / 2 );
					nDrAg       = thisData.nRadialToGrad(nDrAb);
					nDrAs       = ( 360 - nDrAg ) - 135;
					nDrAs       = ( nDrAs < 0 ) ? ( nDrAs + 360 ) : nDrAs;
					nDrRange    = thisData.config['max'] - thisData.config['min'];

					    nDrProz = ( ( nDrAs - thisData.config['min'] ) / nDrRange ) * 100;
					if( nDrProz <   0 || nDrProz  > 115 ) { nDrProz =   0; }
					if( nDrProz > 100 && nDrProz <= 115 ) { nDrProz = 100; }

					thisData.stellung = nDrProz;
				} else
				  {
					// Up-Down Steuerung
					nDrCvDragX = ( nDrCvDragX == -1 ) ? x : nDrCvDragX;
					nDrCvDragY = ( nDrCvDragY == -1 ) ? y : nDrCvDragY;

					if( y > nDrCvDragY )
					{
						thisData.stellung -=   thisData.config['schritte'];
						thisData.stellung  = ( thisData.stellung <=   0 ) ?   0 : thisData.stellung;
					} else
					if( y < nDrCvDragY )
					{
						thisData.stellung +=   thisData.config['schritte'];
						thisData.stellung  = ( thisData.stellung >= 100 ) ? 100 : thisData.stellung;
					}

					nDrCvDragX = x;
					nDrCvDragY = y;
				  }

				thisData.set(thisData.stellung);
			}
		}


		// =============================================================================================================================================================================
		// Hauptfunktionen


		this.resetLED = function()
		{
			clearTimeout(this.config['impuls_timer']);
			this.config['impuls_led'] = 0;
			this.set(this.stellung);
		}


		this.set = function(drcvPROZ)
		{
			drcvID      = ID;
			if( canvas  = document.getElementById(drcvID) )
			{
				// Stellung auf 2 Nachkommastellen abrunden
				// ========================================
				drcvPROZ = Math.round( ( drcvPROZ * 100 ) ) / 100;

				// Werte-Verlauf
				// =============
				if( this.config['wert_verlauf'] ==  1 )
				{
					exProz  = this.percentToExSlow(drcvPROZ);
					exTitle = ' (exponentiell progressiv)';
				} else
				if( this.config['wert_verlauf'] == -1 )
				{
					exProz  = this.percentToExFast(drcvPROZ);
					exTitle = ' (exponentiell degressiv)';
				} else
				  {
					exProz  = drcvPROZ;
					exTitle = '';
				  }

				// Endlosregler
				// ============
				impMode   = 0;
				impOutput = 0;
				if( this.config['impuls'] > 0 )
				{
					if( drcvPROZ < ( this.config['impuls_puffer'] - 20 ) )
					{
						if( ( drcvPROZ + 100 - this.config['impuls_puffer'] ) > this.config['impuls_pro'] )
						{
							// 0-Übergang positiv
							impMode = 1;
						}
					} else
					if( drcvPROZ > ( this.config['impuls_puffer'] + 20 ) )
					{
						if( ( this.config['impuls_puffer'] + 100 - drcvPROZ ) > this.config['impuls_pro'] )
						{
							// 0-Übergang negativ
							impMode = 2;
						}
					} else
					if( drcvPROZ > ( this.config['impuls_puffer'] + this.config['impuls_pro'] ) )
					{
						// normaler UP-Impuls
						impMode = 3;
					} else
					if( drcvPROZ < ( this.config['impuls_puffer'] - this.config['impuls_pro'] ) )
					{
						// normaler DOWN-Impuls
						impMode = 4;
					}

					if( impMode > 0 )
					{
						if( impMode == 1 || impMode == 3 )
						{
							impOutput =  1;
						} else
						if( impMode == 2 || impMode == 4 )
						{
							impOutput = -1;
						}

						this.config['impuls_puffer'] = drcvPROZ;
						this.config['impuls_led']    = 1;
						this.config['impuls_timer']  = setTimeout( function(){ thisData.resetLED(); }, 250);
					}

					this.impuls_wert = impOutput;
				}

				// Canvas-Titel beschreiben
				// ========================
				if( this.config['impuls'] > 0 )
				{
					canvas.title = this.config['impuls_kreis'] + ' Impulse pro Umdrehung';
				} else
				  {
					canvas.title = exProz + '%' + exTitle;
				  }

				ctx                   = canvas.getContext('2d');

				this.config['width']  = canvas.width;
				this.config['height'] = canvas.height;

				nCpX                  = this.config['width']  / 2;
				nCpY                  = this.config['height'] / 2;

				// Radius den anderen Funktionen zur Verfügung stellen
				// ===================================================
				nDrCvRadius           = this.config['radius'];

				// Prozent in Winkel umrechnen
				// ===========================
				if( drcvPROZ <   0 ) { drcvPROZ =   0; }
				if( drcvPROZ > 100 ) { drcvPROZ = 100; }
				this.stellung = drcvPROZ;
				this.winkel   = this.config['min'] + ( ( this.config['max'] - this.config['min'] ) * ( drcvPROZ / 100 ) );
				this.winkel   = Math.round( ( this.winkel * 100 ) ) / 100;

				// Hintergrund
				// ===========
				ctx.clearRect(0, 0, this.config['width'], this.config['height']);
				if( this.config['farbe_hinter'] != '' )
				{
					ctx.fillStyle   = this.config['farbe_hinter'];
					ctx.fillRect(0, 0, this.config['width'], this.config['height']);
				}

				// Knopf
				// =====
				if( this.config['knopf_optik'] == 1 )
				{
					nDrGradient = ctx.createLinearGradient(0, (nCpY+(this.config['radius']/2)), 0, 0);
					nDrGradient.addColorStop(0, this.config['Knopf_farbe_2']);
					nDrGradient.addColorStop(1, this.config['Knopf_farbe_1']);
					ctx.beginPath();
					ctx.lineWidth   = 1;
					ctx.strokeStyle = this.config['Knopf_farbe_2'];
					ctx.fillStyle   = nDrGradient;
					ctx.arc(nCpX, nCpY, this.config['radius'], 0, 2*Math.PI, false);
					ctx.fill();
					ctx.stroke();
					ctx.closePath();
				} else
				if( this.config['knopf_optik'] == 2 )
				{
					// Hintergrund
					ctx.beginPath();
					ctx.lineWidth   = 1;
					ctx.strokeStyle = this.config['Knopf_farbe_2'];
					ctx.fillStyle   = '#DCDCDC';
					ctx.arc(nCpX, nCpY, this.config['radius'], 0, 2*Math.PI, false);
					ctx.fill();
					ctx.stroke();
					ctx.closePath();

					// Farbverläufe Metalleffekt
					for( a = 0; a < 4; a++ )
					{
						for( l = (a*90); l < ((a*90)+90); l++ )
						{
							farbWinkel   = Math.PI * 2 / 360 * (l-135);
							farbSchritte = 100 / 90 * (l-(a*90));

							if( a % 2 == 0 )
							{
								cd = 255 - farbSchritte;
							} else
							  {
								cd = 155 + farbSchritte;
							  }

							ctx.beginPath();
							ctx.strokeStyle = 'rgb('+cd+','+cd+','+cd+')'
							EndPunktX       = this.config['radius'] * Math.cos(farbWinkel);
							EndPunktY       = this.config['radius'] * Math.sin(farbWinkel);
							ctx.moveTo(nCpX, nCpY);
							ctx.lineTo(nCpX + EndPunktX, nCpY + EndPunktY);
							ctx.stroke();
							ctx.closePath();
						}
					}

					// Aussenphase
					rKreis          = Math.round( this.config['radius'] / 10 );
					ctx.lineWidth   = rKreis;
					ctx.strokeStyle = '#BBBBBB';
					ctx.beginPath();
					ctx.arc(nCpX, nCpY, this.config['radius']-(rKreis/2), 0, 2*Math.PI, false);
					ctx.stroke();
					ctx.closePath();
				}

				// Zu benutzende Stellung ermitteln falls es ein Stufenregler ist
				// ==============================================================
				if( this.config['stufen'].length > 0 )
				{
					// Stufen-Regler
					// -------------
					stellungGefunden = 0;
					for( stufe = 0; stufe < this.config['stufen'].length; stufe++ )
					{
						stufenDaten = this.config['stufen'][stufe].split('|');
						if( stufe < ( this.config['stufen'].length - 1) )
						{
							// Es folgt noch eine weiter Stufe
							stufeWeiter = this.config['stufen'][(stufe+1)].split('|');

							if( drcvPROZ >= parseInt(stufenDaten[0]) && drcvPROZ < parseInt(stufeWeiter[0]) )
							{
								// % zwischen dieser und der nächsten Stufe
								useDrcvPROZ      = parseInt(stufenDaten[0]);
								useDrcvTitle     = stufenDaten[1];
								stellungGefunden = 1;
							} else
							  {
								if( stellungGefunden = 0 )
								{
									useDrcvPROZ  = parseInt(stufeWeiter[0]);
									useDrcvTitle =          stufeWeiter[1];
								}
							  }
						} else
						  {
							// Letzte Stufe
							if( drcvPROZ == parseInt(stufenDaten[0]) )
							{
								useDrcvPROZ  = parseInt(stufenDaten[0]);
								useDrcvTitle =          stufenDaten[1];
							}
						  }
					}
				} else
				  {
					// Linear-Regler
					// -------------
					useDrcvPROZ  = drcvPROZ;
					useDrcvTitle = '';
				  }

				// Skala
				// =====
				if( this.config['skala'] > 0 )
				{
					ctx.lineWidth   = 2;
					ctx.fillStyle   = this.config['skala_farbe'];
					ctx.strokeStyle = this.config['skala_farbe'];
					alphaStart      = 135 + this.config['min'];
					alphaEnde       = 135 + this.config['max'];

					if( this.config['stufen'].length > 0 )
					{
						// Stufen-Regler
						// =============
						for( stufe = 0; stufe < this.config['stufen'].length; stufe++ )
						{
							stufenDaten = this.config['stufen'][stufe].split('|');
							text        = stufenDaten[1];

							ctx.beginPath();
							StartPunktX = this.nRadialToCosinus(this.nProzentToRadial(drcvID, stufenDaten[0]), 1.6);
							StartPunktY = this.nRadialToSinus(this.nProzentToRadial(drcvID,   stufenDaten[0]), 1.6);
							EndPunktX   = this.nRadialToCosinus(this.nProzentToRadial(drcvID, stufenDaten[0]), 1.2);
							EndPunktY   = this.nRadialToSinus(this.nProzentToRadial(drcvID,   stufenDaten[0]), 1.2);
							ctx.moveTo((nCpX+StartPunktX),(nCpY+StartPunktY));
							ctx.lineTo((nCpX+EndPunktX),  (nCpY+EndPunktY));
							ctx.stroke();
							ctx.closePath();

							textX = this.nRadialToCosinus(this.nProzentToRadial(drcvID,       stufenDaten[0]), 2.2);
							textY = this.nRadialToSinus(this.nProzentToRadial(drcvID,         stufenDaten[0]), 2.2);
							tl    = ctx.measureText(text).width;
							ctx.fillText(text, (nCpX+(textX-(0.5*tl))), (nCpY+textY+3));
						}
					} else
					  {
						// Linear-Regler
						// =============
						for( st = 0; st < 11; st++ )
						{
							if( this.config['skala_alle'] > 0 && (
								  this.config['skala_alle'] == 1                                         || 
								( this.config['skala_alle'] == 2 && ( st == 0 || st == 5 || st == 10 ) ) || 
								( this.config['skala_alle'] == 3 && ( st == 0 ||            st == 10 ) )
							) )
							{
								// Skalenradius an Größe anpassen
								if( nDrCvRadius > 50 )
								{
									radiusRange = 1.3;
									ssRadius    = radiusRange * 1.07;
								} else
								if( nDrCvRadius > 30 )
								{
									radiusRange = 1.4;
									ssRadius    = radiusRange * 1.1;
								} else
								if( nDrCvRadius > 15 )
								{
									radiusRange = 1.6;
									ssRadius    = radiusRange * 1.15;
								} else
								  {
									radiusRange = 1.8;
									ssRadius    = radiusRange * 1.2;
								  }

								// Skalenstriche
								ssRange = radiusRange;
								if( this.config['skala_striche'] == 1 )
								{
									radiusRange = ssRadius;
									ssStartX    = this.nRadialToCosinus(this.nProzentToRadial(drcvID, (st*10)), ssRange*0.8);
									ssStartY    = this.nRadialToSinus(this.nProzentToRadial(drcvID,   (st*10)), ssRange*0.8);
									ssEndX      = this.nRadialToCosinus(this.nProzentToRadial(drcvID, (st*10)), ssRange*0.95);
									ssEndY      = this.nRadialToSinus(this.nProzentToRadial(drcvID,   (st*10)), ssRange*0.95);
									ctx.beginPath();
									ctx.moveTo((nCpX+ssStartX),(nCpY+ssStartY));
									ctx.lineTo((nCpX+ssEndX),  (nCpY+ssEndY));
									ctx.stroke();
									ctx.closePath();
								}

								if( this.config['skala'] == 1 )
								{
									text  = st;
									textX = this.nRadialToCosinus(this.nProzentToRadial(drcvID, (st*10)), radiusRange);
									textY = this.nRadialToSinus(this.nProzentToRadial(drcvID,   (st*10)), radiusRange);
									tl    = ctx.measureText(text).width;
									ctx.fillText(text, (nCpX+(textX-(0.5*tl))), (nCpY+textY+3));
								} else
								if( this.config['skala'] == 2 )
								{
									text  = st - 5;
									textX = this.nRadialToCosinus(this.nProzentToRadial(drcvID, (st*10)), radiusRange);
									textY = this.nRadialToSinus(this.nProzentToRadial(drcvID,   (st*10)), radiusRange);
									tl    = ctx.measureText(text).width;
									ctx.fillText(text, (nCpX+(textX-(0.5*tl))), (nCpY+textY+3));
								} else
								if( this.config['skala'] == 3 )
								{
									text  = st - 10;
									textX = this.nRadialToCosinus(this.nProzentToRadial(drcvID, (st*10)), radiusRange);
									textY = this.nRadialToSinus(this.nProzentToRadial(drcvID,   (st*10)), radiusRange);
									tl    = ctx.measureText(text).width;
									ctx.fillText(text, (nCpX+(textX-(0.5*tl))), (nCpY+textY+3));
								} else
								  {
									// skala = 4
									if( st <  5 )
									{
										text  = 0.5 + ( 0.1 *   st );
									} else
									if( st == 5 )
									{
										text  = 1;
									} else
									  {
										text  = 1   + ( 0.2 * ( st - 5 ) );
									  }
									textX = this.nRadialToCosinus(this.nProzentToRadial(drcvID, (st*10)), radiusRange);
									textY = this.nRadialToSinus(this.nProzentToRadial(drcvID,   (st*10)), radiusRange);
									tl    = ctx.measureText(text).width;
									ctx.fillText(text, (nCpX+(textX-(0.5*tl))), (nCpY+textY+3));
								  }
							}
						}
					  }
				}

				// Ring
				// ====
				if( this.config['ring'] > 0 )
				{
					// Hintergrund
					// ===========
					if( this.config['ring_hinter'] > 0 )
					{
						if( this.config['ring_hinter'] == 1 )
						{
							alphaStart = 135 + this.config['min'];
							alphaEnde  = 135 + this.config['max'];
						} else
						  {
							alphaStart = 0;
							alphaEnde  = 360;
						  }

						// variable Ringbreite
						// ===================
						if( this.config['ring_breite'] < 0 )
						{
							alphaBetrag = alphaEnde - alphaStart;
							alphaStep   = alphaBetrag / 100;
							for( zp = 0; zp < 100; zp++ )
							{
								ctx.beginPath();
								ctx.lineWidth   = ( 1 + zp ) * -this.config['ring_breite'] / 100;
								ctx.strokeStyle = this.config['ring_hinter_f'];
								ctx.arc(nCpX, nCpY, this.config['radius']+(ctx.lineWidth/2), this.nGradToRadial(alphaStart+(zp*alphaStep)), this.nGradToRadial(alphaStart+(zp+1)*alphaStep));
								ctx.stroke();
								ctx.closePath();
							}
						} else
						  {
							ctx.beginPath();
							ctx.lineWidth   = this.config['ring_breite'];
							ctx.strokeStyle = this.config['ring_hinter_f'];
							ctx.arc(nCpX, nCpY, this.config['radius']+(ctx.lineWidth/2), this.nGradToRadial(alphaStart), this.nGradToRadial(alphaEnde));
							ctx.stroke();
							ctx.closePath();
						  }
					}

					// Vordergrund
					// ===========
					if( this.config['ring'] == 1 )
					{
						if( this.config['mitte'] == 1 )
						{
							// Für Mittelstellung
							// ==================
							if( this.winkel > 135 )
							{
								alphaStart = 135 + 135;
								alphaEnde  = 135 + this.config['min'] + ( ( this.config['max'] - this.config['min'] ) * ( drcvPROZ / 100 ) );
							} else
							if( this.winkel < 135 )
							{
								alphaStart = 135 + this.config['min'] + ( ( this.config['max'] - this.config['min'] ) * ( drcvPROZ / 100 ) );
								alphaEnde  = 135 + 135;
							} else
							  {
								// Mittelstellung => kleiner Punkt
								alphaStart = 135 + 135 - 5;
								alphaEnde  = 135 + 135 + 5;
							  }
						} else
						  {
							// Für Normalstellung
							// ==================
							ringstellung = ( this.config['stufen'].length > 0 ) ? useDrcvPROZ : drcvPROZ;
							if( this.winkel == this.config['min'] )
							{
								// Mittelstellung => kleiner Punkt
								alphaStart = 135 + this.config['min'] - 0;
								alphaEnde  = 135 + this.config['min'] + ( ( this.config['max'] - this.config['min'] ) * ( ringstellung / 100 ) ) + 0;
							} else
							  {
								alphaStart = 135 + this.config['min'];
								alphaEnde  = 135 + this.config['min'] + ( ( this.config['max'] - this.config['min'] ) * ( ringstellung / 100 ) );
							  }
						  }
					} else
						if( this.config['ring'] == 2 )
						{
							alphaStart = 135 + this.config['min'];
							alphaEnde  = 135 + this.config['max'];
						} else
						  {
							alphaStart = 0;
							alphaEnde  = 360;
						  }

					if( this.config['ring_farbe'] == 'rainbow' || this.config['ring_breite'] < 0 )
					{
						alphaBetrag = alphaEnde - alphaStart;
						alphaStep   = ( drcvPROZ == 0 ) ? 0 : ( alphaBetrag / drcvPROZ );
						for( zp = 0; zp < drcvPROZ; zp++ )
						{
							ctx.beginPath();

							// variable Ringbreite
							// ===================
							if( this.config['ring_breite'] < 0 )
							{
								ctx.lineWidth   = ( 1 + zp ) * -this.config['ring_breite'] / 100;
							} else
							  {
								ctx.lineWidth   = this.config['ring_breite'];
							  }

							// Regenbogenfarben
							// ================
							if( this.config['ring_farbe'] == 'rainbow' )
							{
								ctx.strokeStyle = this.nGetRainbow(zp);
							} else
							  {
								ctx.strokeStyle = this.config['ring_farbe'];
							  }

							ctx.arc(nCpX, nCpY, this.config['radius']+(ctx.lineWidth/2), this.nGradToRadial(alphaStart+(zp*alphaStep)), this.nGradToRadial(alphaStart+(zp+1)*alphaStep));
							ctx.stroke();
							ctx.closePath();
						}
					} else
					  {
						ctx.beginPath();
						ctx.lineWidth   = this.config['ring_breite'];
						ctx.strokeStyle = this.config['ring_farbe'];
						ctx.arc(nCpX, nCpY, this.config['radius']+(ctx.lineWidth/2), this.nGradToRadial(alphaStart), this.nGradToRadial(alphaEnde));
						ctx.stroke();
						ctx.closePath();
					  }
				}

				// Knebel
				// ======
				if( this.config['knebel'] == 1 )
				{
					kWidth2         = nDrCvRadius / 4;
					kHeight2        = nDrCvRadius - 2;
					kOuter2         = nDrCvRadius / 2;

					ctx.fillStyle   = this.config['knebel_farbe'];
					ctx.strokeStyle = this.config['knebel_farbe'];
					ctx.lineWidth   = 1;
					ctx.save();
					ctx.translate(nCpX, nCpY);
					ctx.rotate( this.nGradToRadial( this.config['min'] + ( ( this.config['max'] - this.config['min'] ) * ( useDrcvPROZ / 100 ) ) - 135 ) );
					ctx.fillRect(-kWidth2, -kHeight2, (2*kWidth2), (2*kHeight2)+kOuter2);
					ctx.beginPath();
					ctx.moveTo(-kWidth2, -kHeight2);
					ctx.quadraticCurveTo(0, -(kHeight2+3), kWidth2-1, -kHeight2);
					ctx.lineTo(-kWidth2, -kHeight2);
					ctx.stroke();
					ctx.fill();
					ctx.closePath();
					ctx.restore();
				}

				// Punkt oder Strich
				// =================
				if( this.config['punkt'] != '' )
				{
					ctx.beginPath();
					ctx.lineWidth = 3;

					if( this.config['impuls'] > 0 )
					{
						// Blinken bei Impulssteuerung
						if( this.config['impuls_led'] > 0 )
						{
							ctx.strokeStyle = this.config['punkt_farbe'];
							ctx.fillStyle   = this.config['punkt_farbe'];
						} else
						  {
							ctx.strokeStyle = '#303030';
							ctx.fillStyle   = '#303030';
						  }
					} else
					  {
						ctx.strokeStyle = this.config['punkt_farbe'];
						ctx.fillStyle   = this.config['punkt_farbe'];
					  }

					if( this.config['punkt'] == 'strich' )
					{
						StartPunktX = this.nRadialToCosinus(this.nProzentToRadial(drcvID, useDrcvPROZ), 1.0);
						StartPunktY = this.nRadialToSinus(this.nProzentToRadial(drcvID,   useDrcvPROZ), 1.0);

						EndPunktX   = this.nRadialToCosinus(this.nProzentToRadial(drcvID, useDrcvPROZ), 0.4);
						EndPunktY   = this.nRadialToSinus(this.nProzentToRadial(drcvID,   useDrcvPROZ), 0.4);

						ctx.moveTo((nCpX+StartPunktX),(nCpY+StartPunktY));
						ctx.lineTo((nCpX+EndPunktX),  (nCpY+EndPunktY));
					} else
					  {
						StartPunktX = this.nRadialToCosinus(this.nProzentToRadial(drcvID, useDrcvPROZ), 0.7);
						StartPunktY = this.nRadialToSinus(this.nProzentToRadial(drcvID,   useDrcvPROZ), 0.7);

						ctx.arc(nCpX+StartPunktX, nCpY+StartPunktY, 2, 0, 2*Math.PI);
						ctx.fill();
					  }

					ctx.stroke();
					ctx.closePath();
				}

				this.prozente = exProz;
				thisData      = this;

				// Wert in externer Funktion weiter verarbeiten
				// ============================================
				if( typeof(Drehregler_Function) === 'function' )
				{
					Drehregler_Function(thisData);
				}
			} else
			  {
				console.log( 'Drehregler Fehler: Canvas ('+ID+') nicht gefunden!' );
			  }
		};


		this.init = function()
		{
			if( canvas = document.getElementById(ID) )
			{
				// Initialisieren
				// ==============
				canvas.style.cursor = 'grab';

				// Ggf. fehlerhafte Konfiguration überschreiben
				// ============================================
				if( this.config['stufen'].length > 0 && this.config['mitte'] == 1 )
				{
					this.config['mitte'] = 0;
				}

				if( this.config['wert_verlauf'] != 0 && this.config['mitte'] == 1 )
				{
					this.config['wert_verlauf'] = 0;
				}

				if( this.config['ring_breite']   < 0 && this.config['mitte'] == 1 )
				{
					this.config['ring_breite'] = 4;
				}

				// Impulse einrichten bei Endlosregler
				// ===================================
				if( this.config['impuls'] > 0 )
				{
					this.config['impuls_puffer'] = 0;
					this.config['impuls_pro']    = 100 / this.config['impuls_kreis'];

					// Einstellungen ggf. überschreiben
					this.config['min']           = 0;
					this.config['max']           = 360;
					this.config['mitte']         = 0;
					this.config['start']         = 0;
					this.config['skala']         = 0;
					this.config['skala_striche'] = 0;
				}

				this.ID          = ID;
				this.impuls_wert = 0;
				thisData         = this;

				document.getElementById(ID).addEventListener('dblclick',  this.reset,     true);
				document.getElementById(ID).addEventListener('mousedown', this.mouseDown, true);

				document.addEventListener(                   'mouseup',   this.mouseUp,   true);
				document.addEventListener(                   'mousemove', this.mouseMove, true);

				this.set(this.config['start'] );
			} else
			  {
				console.log( 'Drehregler Fehler: Canvas ('+ID+') nicht gefunden!' );
			  }
		}
	}

