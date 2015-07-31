require(["gitbook", "jquery"], function(gitbook, $) {

	function MultipleChoice(input){
		this.qid = input.id;
		this.ans = input.ans;

		this.title = input.title;
		this.option = input.option;

		if(input.hint)	this.hint = input.hint;
		if(input.target) this.target = input.target;
		if(input.count) this.count = input.count;
		if(input.random) this.random = input.random;
		if(input.message) this.message = input.message;
	};

	MultipleChoice.prototype.checkAns = function(input){
		return input===this.ans;
	};

	Array.prototype.shuffle = function() { //thanks stack overflow for this part
		var o = this;
		for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	}

	var init = function(){

		$('.mcqBox').each(function(){

			var question = new MultipleChoice($(this).data('config'));
			var $mcqBox = $(this);

			var correctAnswer = function(){
				$mcqBox.find('.btn.submitMCQ').attr('disabled', true);
				$mcqBox.find('.btn.hintMCQ').attr('disabled', true);
				$mcqBox.find('input[value='+question.ans+']').prop('checked', true);	
				$mcqBox.find('input[name='+question.qid+'_group]').attr('disabled', true);
				$mcqBox.find('.MCQmessage').text('Correct.').hide().show();

				if(question.message)	$mcqBox.find('.MCQdescription').text(question.message).show('slow');
				if(question.target && typeof sectionToggle === "function")	sectionToggle(question.target);
			}

			// prepare options  ---------------------------

			if(question.random || question.count < question.option.length){
				var optionsToShow = [], randomIndex = [];
				for(var i=0; i<question.option.length; i++)
					if(question.option[i].id != question.ans)
						randomIndex.push(i);
					else
						optionsToShow.push(question.option[i]); //push the correct answer

				randomIndex = randomIndex.shuffle().slice(0, question.count-1);

				randomIndex.forEach(function(i){
					optionsToShow.push(question.option[i]);
				});

				optionsToShow = optionsToShow.shuffle();
			}
			else
				optionsToShow = question.option;

			// display the option to html
			optionsToShow.forEach(function(option, i){
				$mcqBox.find('.ansHere'+i).html(option.body).siblings('input').val(option.id);
			});

			// click handler for submit button ---------------------------
			$mcqBox.find('.btn.submitMCQ').click(function(){
				if(question.checkAns($('input[name=' + question.qid + '_group]:checked').val())){
					Cookies.set(question.qid, true, 365); //planting a cookie
					correctAnswer();
				}
				else
					$mcqBox.find('.MCQmessage').text("Wrong answer, try again.").show('slow').delay(1000).hide('slow');
			});

			// click handler for hint button ---------------------------
			$mcqBox.find('.btn.hintMCQ').click(function(){
				$(this).removeClass('btn-info').attr('disabled', true);
				$mcqBox.find('.hint_message').text('('+question.hint+')').show('slow');
			});

			if(Cookies.get(question.qid))
				correctAnswer();
		});
	};

	gitbook.events.bind("page.change", init);
});
