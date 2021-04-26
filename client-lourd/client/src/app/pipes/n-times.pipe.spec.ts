import { NTimesPipe } from './n-times.pipe';

describe('NTimesPipe', () => {
  it('create an instance', () => {
    const pipe = new NTimesPipe();
    expect(pipe).toBeTruthy();
  });

  it('Should return an Array of 10 elements dummy', () => {
    const pipe = new NTimesPipe();
    const dummy = 1;
    expect(pipe.transform(10)).toEqual(new Array(10).fill(dummy));
  });

  it('Should execute 20 times a simple task', () => {
    const pipe = new NTimesPipe();
    const array: number[] = pipe.transform(20);
    expect(array.length).toEqual(20);
  });

  it('Should execute 6705.233 times a simple task. the task should be made 6705 times ', () => {
    const pipe = new NTimesPipe();
    const array: number[] = pipe.transform(6705.234);
    let count = 0;
    array.forEach(() => {
      count++;
    });
    expect(count).toEqual(6705);
  });

});
