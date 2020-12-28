const assert = require('assert');
const objectMergeAdvanced = require("object-merge-advanced");

describe('object-merge', function() {
  it('simple convert', function() {
    const expected = {
      name: "B",
      products: [
        {id: '1', source: "abc"},
        {id: '2', source: "abc"},
        {id: '3', source: "abc", name: "B"},
        {id: '4', source: "abc"},
        {id: '5', source: "abc"},
        {id: '6', source: "123"},
        {id: '6', source: "abc"},
      ]
    };
    const obj1 = {
      name: "A",
      products: [
        {id: '1', source: "abc"},
        {id: '2', source: "abc"},
        {id: '3', source: "abc", name: "A"},
        {id: '6', source: "abc"},
      ]
    };
    const obj2 = {
      name: "B",
      products: [
        {id: '3', source: "abc", name: "B"},
        {id: '4', source: "abc"},
        {id: '5', source: "abc"},
        {id: '6', source: "123"},
      ]
    };
    const options = {
      hardArrayConcat: false,
      hardArrayConcatKeys: ["products"],
      cb: (inputArg1, inputArg2, resultAboutToBeReturned, infoObj) => {
        if(infoObj.key === "products") {
          return [...inputArg2, ...inputArg1]
            .filter((v, i, array) => array.filter(r => r.id == v.id && r.source == v.source)[0] === v)
            .sort((a, b) => a.id?.localeCompare(b.id) || a.source?.localeCompare(b.source));
        }
        //console.log(`${infoObj} = ${resultAboutToBeReturned}`)
        return resultAboutToBeReturned;
      },
    };
    const merged = objectMergeAdvanced(obj1, obj2, options);
    assert.deepStrictEqual(merged, expected);
  });
});