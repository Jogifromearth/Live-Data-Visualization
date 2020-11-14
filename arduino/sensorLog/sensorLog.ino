/***************************************************************************
  This is a library for the APDS9960 digital proximity, ambient light, RGB, and gesture sensor

  This sketch puts the sensor in color mode and reads the RGB and clear values.

  Designed specifically to work with the Adafruit APDS9960 breakout
  ----> http://www.adafruit.com/products/3595

  These sensors use I2C to communicate. The device's I2C address is 0x39

  Adafruit invests time and resources providing this open source code,
  please support Adafruit andopen-source hardware by purchasing products
  from Adafruit!

  Written by Dean Miller for Adafruit Industries.
  BSD license, all text above must be included in any redistribution
 ***************************************************************************/

#include "Adafruit_APDS9960.h"
Adafruit_APDS9960 apds;

//Joystick pins
int vrX = A0; 
int vrY = A1;

int x = 492; //x value of the joystick
int y = 517; //y default-value of the joystick
int sw = 0; // switch button default-value 

void setup() {
  Serial.begin(115200);

  if(!apds.begin()){
    Serial.println("failed to initialize device! Please check your wiring.");
  }
  else Serial.println("Device initialized!");

  //enable color sensign mode
  apds.enableColor(true);
}

void loop() {
  //create some variables to store the color data in
  uint16_t r, g, b, c;
  
  //wait for color data to be ready
  while(!apds.colorDataReady()){
    delay(5);
  }

  //get the data and print the different channels
  apds.getColorData(&r, &g, &b, &c);

  x = analogRead(vrX);
  y = analogRead(vrY);
  sw = analogRead(A2);
  
  Serial.print(r);
  
  Serial.print(", ");
  Serial.print(g);
  
  Serial.print(", ");
  Serial.print(b);
  
  Serial.print(", ");
  Serial.print(c);

  Serial.print(", ");
  Serial.print(x);
  
  Serial.print(", ");
  Serial.print(y);

  Serial.print(", ");
  Serial.println(sw);
  
  delay(100);
}
