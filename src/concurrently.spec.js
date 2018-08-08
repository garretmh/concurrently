const EventEmitter = require('events');

const concurrently = require('./concurrently');

let spawn, kill, controllers;
beforeEach(() => {
    const process = new EventEmitter();
    process.pid = 1;

    spawn = jest.fn(() => process);
    kill = jest.fn();
    controllers = [{ handle: jest.fn() }, { handle: jest.fn() }];
});

const create = (commands, options = {}) => concurrently(
    commands,
    Object.assign(options, { controllers, spawn, kill })
);

it('fails if commands is not an array', () => {
    const bomb = () => create('foo');
    expect(bomb).toThrowError();
});

it('fails if no commands were provided', () => {
    const bomb = () => create([]);
    expect(bomb).toThrowError();
});

it('spawns all commands', () => {
    create(['echo', 'kill']);
    expect(spawn).toHaveBeenCalledTimes(2);
    expect(spawn).toHaveBeenCalledWith('echo', expect.objectContaining({}));
    expect(spawn).toHaveBeenCalledWith('kill', expect.objectContaining({}));
});

it('runs controllers with the commands', () => {
    create(['echo', '"echo wrapped"']);

    controllers.forEach(controller => {
        expect(controller.handle).toHaveBeenCalledWith([
            expect.objectContaining({ command: 'echo', index: 0 }),
            expect.objectContaining({ command: 'echo wrapped', index: 1 }),
        ]);
    });
});

it('runs commands with a name or prefix color', () => {
    create([
        { command: 'echo', prefixColor: 'red', name: 'foo' },
        'kill'
    ]);

    controllers.forEach(controller => {
        expect(controller.handle).toHaveBeenCalledWith([
            expect.objectContaining({ command: 'echo', index: 0, name: 'foo', prefixColor: 'red' }),
            expect.objectContaining({ command: 'kill', index: 1, name: '', prefixColor: '' }),
        ]);
    });
});
