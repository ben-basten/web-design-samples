var vm = new Vue({
    el: "#app",
    data: {
        message: "hello",
        results: null,
        type: [
            "neutral",
            "win",
            "loss",
            "draw"
        ],
        names: [
            0,
            1,
            2
        ],
        pairs: {
            0: 0, //opposite of neutral is neutral
            1: 2, //opposite of win is loss
            2: 1, //opposite of loss is win
            3: 3  //opposite of draw is draw
        }
    },
    methods: {
        changeResult(row, col) {
            var data = this.results[row][col];
            if (data != -1) {
                data++;
                if (data > 3) {
                    data = 0;
                }
                this.results[row].splice(col, 1, data);
                this.results[col].splice(row, 1, this.pairs[data]);
            }
            $.post("/updateResults", { newResults: this.results }, function (response) {
                console.log('results updated.');
            });
        },
        resultType(value) {
            return this.type[value];
        },
        currentSize() {
            return results.length;
        },
        displayInput(index) {
            var inputElement = '#input' + index;
            var textElement = '#text' + index;
            $(textElement).hide();
            $(inputElement).val(this.names[index]);
            $(inputElement).show();
            $(inputElement).focus();
            $(inputElement).select();
            $(inputElement).keypress(function (event) {
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if (keycode == '13') {
                    vm.hideInput(index);
                }
            });
        },
        hideInput(index) {
            var inputElement = '#input' + index;
            var textElement = '#text' + index;
            if ($(inputElement).val() != "") {
                this.names.splice(index, 1, $(inputElement).val());
                $.post('/changeNames', {names: this.names}, null);
            }
            $(textElement).show();
            $(inputElement).hide();
        }
    },
    computed: {},
});

//initial data retrieval from server
$.post('/getTable', {}, function (data) {
    vm.results = data.results;
    vm.names = data.names;
    $('#quantity').val(vm.results.length);
});

$('#resetBracket').click(function () {
    $.post('/resetBracket', { quantity: $('#quantity').val() }, function (newResults) {
        vm.results = newResults;
    });
});

$('#resetNames').click(function (){
    $.post('/resetNames', { quantity: $('#quantity').val() }, function (newNames) {
        vm.names = newNames;
    });
});

$('#quantity').change(function () {
    $.post('/changeQuantity', { quantity: $('#quantity').val() }, function (data) {
        vm.results = data.results;
        vm.names = data.names;
    });
});