import * as _ from 'lodash';
import { Component, AfterViewInit, OnChanges, SimpleChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { IDrawCommand } from './../../scripts/model';
import { StateService, VectorLayerType } from './../../state.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-command',
  template: `
  <canvas #commandIndexCanvas
      class="command-index"></canvas>

  <span fxFlex>{{ drawCommandEndPointText }}</span>

  <button md-icon-button
      mdTooltip="Edit point"
      mdTooltipPosition="above"
      md-theme="dark"
      [fxShow]="isEditable()"
      fxLayoutAlign="center center"
      (click)="onEditPointClick()">
    <md-icon class="md-24">mode_edit</md-icon>
  </button>

  <button md-icon-button
      mdTooltip="Delete point"
      mdTooltipPosition="above"
      md-theme="dark"
      fxLayoutAlign="center center"
      [fxShow]="isDeletable()"
      (click)="onDeletePointClick()">
    <md-icon class="md-24">delete</md-icon>
  </button>`,
  styleUrls: ['./command.component.scss']
})
export class CommandComponent implements AfterViewInit, OnChanges {
  @ViewChild('commandIndexCanvas') private commandIndexCanvas: ElementRef;
  @Input() vectorLayerType: VectorLayerType;
  @Input() commandIndex: number;
  @Input() drawCommand: IDrawCommand;

  constructor(private stateService: StateService) { }

  ngAfterViewInit() {
    this.drawCommandIndex();
  }

  // TODO(alockwood): use ngFor trackBy to avoid recreating these items on animation frames
  ngOnChanges(changes: SimpleChanges) {
    this.drawCommandIndex();
  }

  private drawCommandIndex() {
    const canvas = $(this.commandIndexCanvas.nativeElement);
    const commandIndexCanvasSize = canvas.get(0).getBoundingClientRect().width;
    const width = commandIndexCanvasSize;
    const height = commandIndexCanvasSize;
    const dpi = window.devicePixelRatio || 1;
    canvas
      .attr({ width: width * dpi, height: height * dpi })
      .css({ width, height });

    const ctx: CanvasRenderingContext2D = (canvas.get(0) as any).getContext('2d');
    const radius = commandIndexCanvasSize * dpi / 2;

    ctx.save();
    const color = 'green';
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.font = radius + 'px serif';
    const text = (this.commandIndex + 1).toString();
    const textWidth = ctx.measureText(text).width;
    // TODO(alockwood): is there a better way to get the height?
    const textHeight = ctx.measureText('o').width;
    ctx.fillText(text, radius - textWidth / 2, radius + textHeight / 2);
    ctx.fill();
    ctx.restore();
  }

  get drawCommandEndPointText() {
    const c = this.drawCommand;
    if (c.svgChar.toUpperCase() === 'Z') {
      return `${c.svgChar}`;
    } else {
      const p = _.last(c.points);
      const x = Number(p.x.toFixed(3)).toString();
      const y = Number(p.y.toFixed(3)).toString();
      return `${c.svgChar} ${x}, ${y}`;
    }
  }

  isEditable() {
    return false;
  }

  isDeletable() {
    return this.drawCommand.isModfiable;
  }

  onEditPointClick() {
    // TODO(alockwood): implement this
    this.stateService.notifyVectorLayerChange(this.vectorLayerType);
  }

  onDeletePointClick() {
    console.log('delete');
    this.drawCommand.delete();
    this.stateService.notifyVectorLayerChange(this.vectorLayerType);
  }
}
