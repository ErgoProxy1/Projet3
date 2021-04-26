import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    spyOn(component['_socket'], 'emit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change channels', () => {
    let channels = component.channels;
    expect(component.curChannel.name).toEqual(channels[0].name);
    expect(component.curIndex).toEqual(0);
    component.onChangeChannel(channels[1]);
    expect(component.curChannel.name).toEqual(channels[1].name);
    expect(component.curIndex).toEqual(1);
    component.onChangeChannel(channels[0]);
    expect(component.curChannel.name).toEqual(channels[0].name);
    expect(component.curIndex).toEqual(0);
  });

  it('should not change channels if non-existant', () => {
    let channels = component.channels;
    expect(component.curChannel.name).toEqual(channels[0].name);
    expect(component.curIndex).toEqual(0);
    component.onChangeChannel({name: 'test', messages: [], creator: 'tester'});
    expect(component.curChannel.name).toEqual(channels[0].name);
    expect(component.curIndex).toEqual(0);
  });

  it('should send message', () => {
    component['_auth'].username = 'test',
    component.sendMessage('TEST!');
    expect(component.curChannel.messages.length).toEqual(1);
    expect(component.curChannel.messages[0].text).toEqual('TEST!');
    expect(component['_socket'].emit).toHaveBeenCalledWith('message', JSON.stringify(component.curChannel.messages[0]));
    component['_auth'].username = '';
  })

  it('should not send message if empty', () => {
    component['_auth'].username = 'test';
    component.sendMessage('');
    expect(component.curChannel.messages.length).toEqual(0);
    expect(component.curChannel.messages[0]).toBeUndefined();
    expect(component['_socket'].emit).not.toHaveBeenCalled();
    component['_auth'].username = '';
  })

  it('should add channel', () => {
    expect(component.activeChannels).toEqual(2);
    component.addChannel();
    expect(component.activeChannels).toEqual(3);
  })

  it('should delete channel', () => {
    expect(component.activeChannels).toEqual(2);
    component.addChannel();
    expect(component.activeChannels).toEqual(3);
    component.deleteChannel()
    expect(component.activeChannels).toEqual(2);
  })

  it('should not delete channel if not creator', () => {
    component['_auth'].username = 'test';
    expect(component.activeChannels).toEqual(2);
    component.addChannel();
    expect(component.activeChannels).toEqual(3);
    component['_auth'].username = 'test2';
    component.deleteChannel();
    expect(component.activeChannels).toEqual(3);
    component['_auth'].username = '';
  })
});
