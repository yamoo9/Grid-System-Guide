// Function.prototype.bind
if (!('bind' in Function.prototype)) {
	Function.prototype.bind= function(owner) {
		var that= this;
		if (arguments.length<=1) {
			return function() { return that.apply(owner, arguments); };
		} else {
			var args= Array.prototype.slice.call(arguments, 1);
			return function() {
				return that.apply(owner, arguments.length===0? args : args.concat(Array.prototype.slice.call(arguments)));
			};
		}
	};
};

(function(global, $){
	'use strict';

	// 스코프 지역 변수
	var doc  = global.document, // #document 객체
		head = doc.head,
		body = null, // DOM이 완성된 후, doc.body 참조
		grid_container;
	// Grid System (GS) 객체
	var GS = {
		/**
		 * gs 객체 프로퍼티
		 * gs_markup: 동적으로 추가되는 #grid-system HTML 코드
		 * gs_style: 동적으로 추가되어 Grid-System을 그려주는 CSS 코드
		 */
		gs_markup  : null,
		gs_style : null,
		/**
		 * 옵션 기본 객체
		 * grid:
		 * 		문서 폭(page_width)
		 * 		컬럼의 개수(columns)
		 * 		거터 폭(gutter)
		 * 		리딩 간격(reading)
		 * 		글꼴 사이즈(font_size)
		 * 		컬럼 색상(columns_color)
		 * 		베이스라인 색상(reading_color)
		 * config:
		 * 		markup:
		 * 			프리픽스(prefix)
		 * 			그리드 아이디(grid_id)
		 * 			컬럼 아이디(columns_id)
		 * 			레딩 아이디(reading_id)
		 * callback:
		 * 		콜백 함수
		 */
		options: {
			grid: {
				page_width : 960,
				columns    : 12,
				gutter     : 20,
				font_size  : 14,
				reading    : 1.5,
				columns_color: '#fe4940',
				reading_color: '#2d8b9c'
			},
			config: {
				markup:{
					prefix     : 'GS', // 접두사
					grid_id    : 'grid-system',
					columns_id : 'grid-columns',
					reading_id : 'grid-reading',
				},
				style: {
					columns_zindex : 10000,
					reading_zindex : 11000,
					opacity        : 0.5,
				}
			},
			callback: function(){}
		},
		/**
		 * init() 메소드
		 * GS.init() 실행 시, GS 객체의 메소드를 작동시켜줍니다.
		 * GS.init({
		 * 	grid: {  }
		 * });
		 */
		init: function(options) {
			this.extend(options);
			this.generateGSM();
			this.render();
			this.listen();
			this.options.callback();
			return this;
		},
		/**
		 * extend() 메소드
		 * 기본 options 객체를 사용자 정의 options 객체의 프로퍼티와 비교하여 덮어씁니다.
		 */
		extend: function(options) {
			// 사용자 정의 options 유효성 검사
			// 전달된 options 유형이 객체가 아니거나 배열이라면 기본 options 객체를 덮어쓰지 않도록 함수를 종료시킵니다.
			if (typeof options != 'object' || options instanceof Array ) { return; }
			// 유효성 검사에 통과되면 기본 options 객체의 프로퍼티를 사용자 정의 options 프로퍼티 값으로 덮어씁니다.
			var target = this.options;
			extend_helper(target, options);
		},
		/**
		 * generateGSM() 메소드
		 * GS HTML 마크업 코드를 생성합니다.
		 */
		generateGSM: function() {
			var o           = this.options.config.markup,
				prefix      = o.prefix,
				prefix_join = prefix ? '-':'';

			o.grid_id = prefix + prefix_join + o.grid_id;
			o.columns = prefix + prefix_join + o.columns_id;
			o.reading_id = prefix + prefix_join + o.reading_id;

			this.gs_markup = [
				'<div id="'+ o.grid_id +'">',
					'<div id="'+ o.columns_id +'"></div>',
					'<div id="'+ o.reading_id +'"></div>',
				'</div>'
			].join('');
		},
		/**
		 * generateGSS() 메소드
		 * GS CSS 스타일 코드를 생성합니다.
		 */
		generateGSS: function(callback) {
			var om           = this.options.config.markup,
				os           = this.options.config.style,
				og           = this.options.grid,
				column_width = (og.page_width - (og.gutter*og.columns))/og.columns,

				grid_id      = '#'+ om.grid_id,
				columns_id   = '#'+ om.columns_id,
				reading_id   = '#'+ om.reading_id,

				doc_height   = body.clientHeight > 0 ? body.clientHeight + 'px' : '100%';

			// grid-system
			this.gs_style = '';
			this.gs_style += grid_id + '{display: none;}';
			this.gs_style += grid_id + '.view{display: block;}';
			this.gs_style += grid_id +' *{position: absolute; top: 0; height:'+ doc_height +';}';
			// columns
			this.gs_style += grid_id +' '+ columns_id +'{opacity: '+ os.opacity +';';
			this.gs_style += 'z-index: '+ os.columns_zindex +';';
			this.gs_style += 'left: 50%; width:'+ og.page_width +'px;';
			this.gs_style += 'margin-left: '+ -og.page_width/2 +'px;';
			this.gs_style += 'background-image: linear-gradient(90deg, transparent '+ column_width +'px, '+ og.columns_color +' '+ og.gutter +'px);';
			this.gs_style += 'background-size: '+ (column_width + og.gutter) +'px; background-position: '+ og.gutter/2 +'px;}';

			// console.log(this.gs_style);

			// reading
			this.gs_style += grid_id +' '+ reading_id +'{';
			this.gs_style += 'opacity: '+ os.opacity +';';
			this.gs_style += 'z-index: '+ os.reading_zindex +';';
			this.gs_style += 'left: 0; width: 100%;';
			this.gs_style += 'background-image:linear-gradient(0deg, '+ og.reading_color +' 1px, transparent 0px);';
			this.gs_style += 'background-size: '+ (og.font_size * og.reading)*1.73 +'px;';

			callback();
		},
		/**
		 * attachGS() 메소드
		 * 동적으로 생성된 그리드 시스템 마크업, 스타일 코드를 <body>, <head> 내부에 각각 삽입합니다.
		 */
		attachGS: function() {
			// that 지역 변수에 GS(this) 객체 참조
			var that = this;
			// body 변수 참조 값이 없을 때(null)만 수행되어 doc.body 참조
			if (!body) { body = doc.body }
			// <body>의 첫번째 자식 요소로 동적으로 생성된 gs_markup 삽입
			body.insertAdjacentHTML('afterbegin', that.gs_markup);
			// GS 객체 generateGS 메소드 실행
			// 완료 후 callback 함수 실행
			that.generateGSS(function() {
				// <head>의 마지막 자식 요소로 동적으로 생성된 gs_style 삽입
				head.insertAdjacentHTML(
					'beforeend',
					'<style id="'+that.options.config.markup.prefix+'">'+that.gs_style+'</style>'
				);
			});
		},
		/**
		 * render() 메소드
		 * DOM이 완성되면 attachGS() 메소드를 작동시켜줍니다.
		 */
		render: function() {
			var _render = this.attachGS.bind(this),
				_toggleGS = this.toggleGrid.bind(this);
			// DOM이 완성되면 GS 객체 메소드 render() 실행
			if (global.addEventListener) {
				global.addEventListener('DOMContentLoaded', _render, false);
				global.addEventListener('DOMContentLoaded', _toggleGS, false);
			}
			else {
				var old_loadFn = global.onload;
				global.onload = function() {
					old_loadFn();
					_render();
					_toggleGS();
				}
			}
		},
		toggleGrid: function() {
			if (!grid_container) {
				grid_container = doc.getElementById( this.options.config.markup.grid_id );
			}

			grid_container.classList.toggle('view');

			if (typeof doc.onkeydown !== 'function') {
				doc.onkeydown = function(evt) {
					var key = evt.keyCode || evt.which;
					if (key === 71) { // g 키보드
						grid_container.classList.toggle('view');
					}
				}
			}
		},
		/**
		 * listen() 메소드
		 *
		 */
		listen: function() {
			var that = this;
			// global.addEventListener('resize', that.render, false);
		}
	};

	// 전역 객체 global(window)의 gs 프로퍼티에 GS 객체 참조
	global.GS = GS;

	// 헬퍼함수
	function extend_helper(target, obj) {
		for (var prop in obj) {
			if (typeof obj[prop] === 'object') {
				target[prop] = extend_helper(target[prop], obj[prop]);
			} else {
				if (target[prop]) {
					target[prop] = obj[prop];
				}
			}
		}
		return target;
	}

})(window);