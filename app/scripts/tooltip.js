console.log('hello')

const el_tooltip_wrappers = document.querySelectorAll('.tooltip-wrapper');
[].forEach.call(el_tooltip_wrappers, el => {
    const el_tooltip_trigger = el.querySelector('[data-tooltip]');
    const el_tooltip = el.querySelector('.tooltip');
    el_tooltip_trigger.addEventListener("mouseover", () => {
        el_tooltip.classList.add("show");
        console.log('add')
    });
    el_tooltip_trigger.addEventListener("mouseout", () => {
        el_tooltip.classList.remove("show");
        console.log('remove')
    });
})
