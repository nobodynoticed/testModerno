// ФУНКЦИЯ ОПРЕДЕЛЕНИЯ ПОДДЕРЖКИ WEBP
function testWebP(callback) {

	var webP = new Image();
	webP.onload = webP.onerror = function () {
		callback(webP.height == 2);
	};
	webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP(function (support) {

	if (support == true) {
		document.querySelector('body').classList.add('webp');
	} else {
		document.querySelector('body').classList.add('no-webp');
	}
});
// ++++++++++++++++++++++++++++++++++++++++++++++

$(function () {

	$('.rate-star').rateYo({
		rating: 5,
		starWidth: '12px',
		readOnly: true
	});

	$('.product-slider__inner').slick({
		dots: true,
		arrows: false,
		slidesToShow: 4,
		slidesToScroll: 4
	});

	$(".js-range-slider").ionRangeSlider({
		type: "double",
		min: 0,
		max: 1000,
		from: 0,
		to: 600,
		grid: false,
		prefix: '$'
	});

	$('.icon-th-list').on('click', function () {
		$('.product-item').addClass('active');
		$('.icon-th-list').addClass('active');
		$('.icon-th-large').removeClass('active');

	});

	$('.icon-th-large').on('click', function () {
		$('.product-item').removeClass('active');
		$('.icon-th-large').addClass('active');
		$('.icon-th-list').removeClass('active');
	});

	$('.menu-btn').on('click', function () {
		$('.menu__list').slideToggle();
	});

	$('.header__btn-menu').on('click', function () {
		$('.header__box').toggleClass('active');
	});



	let mix = $('.products__box');
	if (mix) {
		var mixer = mixitup(mix);
	}

});