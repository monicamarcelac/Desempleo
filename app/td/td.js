(function td() {

        var td = d3.select("#td"),
            margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = +td.attr("width") - margin.left - margin.right,
            height = +td.attr("height") - margin.top - margin.bottom;

        var parseTime = d3.timeParse("%Y")
        bisectDate = d3.bisector(function (d) {
            return d.year;
        }).left;

        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        var line = d3.line()
            .x(function (d) {
                return x(d.year);
            })
            .y(function (d) {
                return y(d.value);
            });

        var og = td.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.json("data/td.json", function (error, data) {
            if (error) throw error;

            data.forEach(function (d) {
                d.year = parseTime(d.year);
                d.value = +d.value;
            });

            x.domain(d3.extent(data, function (d) {
                return d.year;
            }));
            y.domain([d3.min(data, function (d) {
                return d.value;
            }) / 1.005, d3.max(data, function (d) {
                return d.value;
            }) * 1.005]);

            og.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            og.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y).ticks(6).tickFormat(function (d) {
                    return parseInt(d) + "%";
                }))
                .append("text")
                .attr("class", "axis-title")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .attr("fill", "#5D6971")
                .text("Tasa de desempleo");

            og.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line);

            var focus = og.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus.append("line")
                .attr("class", "x-hover-line hover-line")
                .attr("y1", 0)
                .attr("y2", height);

            focus.append("line")
                .attr("class", "y-hover-line hover-line")
                .attr("x1", height)
                .attr("x2", height);

            focus.append("circle")
                .attr("r", 7.5);

            focus.append("text")
                .attr("x", 15)
                .attr("dy", ".31em");

            td.append("rect")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .on("mouseover", function () {
                    focus.style("display", null);
                })
                .on("mouseout", function () {
                    focus.style("display", "none");
                })
                .on("mousemove", mousemove);

            function mousemove() {
                var x0 = x.invert(d3.mouse(this)[0]),
                    i = bisectDate(data, x0, 1),
                    d0 = data[i - 1],
                    d1 = data[i],
                    d = x0 - d0.year > d1.year - x0 ? d1 : d0;
                focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
                focus.select("text").text(function () {
                    return d3.format(".4n")(d.value) + "%";
                })
                    .style("font-family", "sans-serif")
                    .style("font-size", "10pt");
                focus.select(".x-hover-line").attr("y2", height - y(d.value));
                focus.select(".y-hover-line").attr("x2", width + width);
            }

        })
    }
)();