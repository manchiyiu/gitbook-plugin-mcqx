require(["gitbook", "jquery"], function(gitbook, $) {

    function MultipleChoice(input) {
        this.qid = input.id;
        this.ans = input.ans;

        this.title = input.title;
        this.option = input.option;

        this.attempts = 0;

        if (input.hint) this.hint = input.hint;
        if (input.count) this.count = input.count;
        if (input.random) this.random = input.random;
        if (input.message) this.message = input.message;
        if (input.incorrect) this.incorrect = input.incorrect;
        if (input.maxattempts) this.maxattempts = input.maxattempts;
    }

    MultipleChoice.prototype.checkAns = function(input) {
        return input === this.ans;
    };

    Array.prototype.shuffle = function() { //thanks stack overflow for this part
        var o = this;
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    var init = function() {

        if(!$('.toolbar-delete').length)
            gitbook.toolbar.createButton({
                position: 'left',
                icon: 'fa fa-history',
                className: 'toolbar-delete',
                onClick: function() {
                    $('.gitQuestion').each(function() {
                        Cookies.remove($(this).data('id'));
                    });
                    $(this).prepend('<p class="historyMessage">History cleared. Refreshing ...</p>');
                    $('.historyMessage').hide().fadeIn('slow').delay(2000).fadeOut('slow').delay(1).queue(function() {
                        $(this).remove();
                        location.reload();
                    });
                }
            });

        $('.mcqx').each(function() {

            if ($(this).data('done'))
                return;

            $(this).data('done', true);

            var $mcqBox = $(this).children('.mcqBox');
            var question = new MultipleChoice($mcqBox.data('config'));
            $mcqBox.find('.MCQmessage, .MCQdescription').hide();

            var correctAnswer = function(animation) {
                $mcqBox.find('.submitMCQ, .hintMCQ').attr('disabled', true);
                $mcqBox.find('input[value=' + question.ans + ']').prop('checked', true);
                $mcqBox.find('input[name=' + question.qid + '_group]').attr('disabled', true);

                var speed = animation ? 'slow' : null;
                $mcqBox.find('.MCQmessage').text('Correct.').show(speed);

                if (question.message)
                    $mcqBox.find('.MCQdescription').text(question.message).show(speed);
            };

            //incorrect answer handling when max attempts are specified.
            var incorrectAnswer = function(animation) {
                $mcqBox.find('.submitMCQ, .hintMCQ').attr('disabled', true);
                $mcqBox.find('input[name=' + question.qid + '_group]').attr('disabled', true);

                var speed = animation ? 'slow' : null;

                $mcqBox.find('.MCQmessage').text((question.incorrect) ? question.incorrect : "Wrong answer.").show(speed);
            };

            // prepare options  ---------------------------
            var optionsToShow = [];
            if (question.random || question.count < question.option.length) {
                var randomIndex = [];
                for (var i = 0; i < question.option.length; i++)
                    if (question.option[i].id != question.ans)
                        randomIndex.push(i);
                    else
                        optionsToShow.push(question.option[i]); //push the correct answer

                randomIndex = randomIndex.shuffle().slice(0, question.count - 1);

                randomIndex.forEach(function(i) {
                    optionsToShow.push(question.option[i]);
                });

                optionsToShow = optionsToShow.shuffle();
            } else
                optionsToShow = question.option;

            // display the option to html
            optionsToShow.forEach(function(option, i) {
                $mcqBox.find('.ansHere' + i).html(option.body).siblings('input').val(option.id);
            });

            // click handler for submit button ---------------------------
            $mcqBox.find('.submitMCQ').click(function() {
                if (question.checkAns($('input[name=' + question.qid + '_group]:checked').val())) {
                    Cookies.set(question.qid, true, {
                        expires: 365
                    }); //planting a cookie
                    correctAnswer(true);
                } else {
                  //if incorrect, increase question attempts counter.
                  question.attempts++;
                  //if max attempts reached, mark answer as incorrect.
                  if(question.attempts >= question.maxattempts){
                    incorrectAnswer(true);
                  } else {
                  //if incorrect, display custom message (or default if one is not specified)
                  $mcqBox.find('.MCQmessage').text((question.incorrect) ? question.incorrect : "Wrong answer, try again.").show('slow').delay(1000).hide('slow');
                }
            });

            // click handler for hint button ---------------------------
            $mcqBox.find('.hintMCQ').click(function() {
                $(this).attr('disabled', true);
                $mcqBox.find('.hint_message').text(question.hint).show('slow');
            });

            if (Cookies.get(question.qid))
                correctAnswer(false);

            // handler for dark theme
            setTimeout(function() {
                if ($('.book').hasClass('color-theme-2'))
                    $mcqBox.addClass('dark');
            }, 1);

            $('#color-theme-preview-0, #color-theme-preview-1').click(function() {
                $mcqBox.removeClass('dark');
            });

            $('#color-theme-preview-2').click(function() {
                $mcqBox.addClass('dark');
            });
        });
    };

    gitbook.events.bind("page.change", init);
});
