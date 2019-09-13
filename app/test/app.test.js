
it('Should return the corresponding value', ()=>{
    const filterTestFn = jest.fn();

    // Make the mock return `true` for the first call,
    // and `false` for the second call
    filterTestFn.mockReturnValueOnce(true).mockReturnValueOnce(false);

    const result = [11, 12].filter(filterTestFn);
    expect(result).toEqual([11])
    // console.log(result);
    // // > [11]
    // console.log(filterTestFn.mock.calls);
    // // > [ [11], [12] ]
})